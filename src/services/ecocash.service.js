/**
 * EcoCash Lesotho Payment Service
 * Handles payments, queries, and webhooks
 * @module services/ecocash.service
 */

const axios = require('axios');
const crypto = require('crypto');
const ecocashConfig = require('../config/ecocash');
const logger = require('../utils/logger');
const { MobileMoneyTransaction, PaymentWebhookLog } = require('../models');
const idempotency = require('../utils/transactionIdempotency');
const { ApiError } = require('../utils/apiError');

class EcoCashService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth token with caching
   */
  async getAccessToken() {
    try {
      ecocashConfig.requireConfigured();

      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
        return this.accessToken;
      }

      logger.info('Fetching new EcoCash access token');

      const response = await axios({
        method: 'POST',
        url: ecocashConfig.currentEndpoints.auth,
        headers: {
          Authorization: ecocashConfig.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials',
        timeout: 30000
      });

      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid token response from EcoCash');
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in || 3600) * 1000 - 60000;

      logger.info('EcoCash access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get EcoCash access token:', error);
      throw new ApiError(500, 'EcoCash authentication failed', 'ECOCASH_AUTH_ERROR');
    }
  }

  /**
   * Initiate payment (Customer to Merchant)
   */
  async initiatePayment({
    phoneNumber,
    amount,
    currency = 'LSL',
    reference,
    description,
    transactionId,
    language = 'EN',
    callbackUrl = null
  }) {
    ecocashConfig.requireConfigured();

    const idempotencyKey = `ecocash_${transactionId}_${Date.now()}`;
    
    const isDuplicate = await idempotency.check(idempotencyKey);
    if (isDuplicate) {
      logger.warn(`Duplicate EcoCash payment request: ${idempotencyKey}`);
      throw new ApiError(409, 'Duplicate transaction detected', 'DUPLICATE_TRANSACTION');
    }

    try {
      const token = await this.getAccessToken();
      const timestamp = ecocashConfig.generateTimestamp();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody = {
        merchantId: ecocashConfig.merchantId,
        merchantName: ecocashConfig.merchantName,
        shortCode: ecocashConfig.shortcode,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customerMsisdn: formattedPhone,
        transactionReference: reference,
        transactionDescription: description.substring(0, 100),
        paymentType: ecocashConfig.paymentTypes.CUSTOMER_PAY,
        language,
        timestamp,
        callbackUrl: callbackUrl || `${ecocashConfig.callbackBaseUrl}/api/v1/webhooks/ecocash`,
        metadata: {
          transactionId,
          idempotencyKey
        }
      };

      // Generate signature
      const signature = ecocashConfig.generateSignature(requestBody, timestamp);
      requestBody.signature = signature;

      logger.info(`Initiating EcoCash payment for transaction ${transactionId}`, {
        phoneNumber: formattedPhone,
        amount,
        reference
      });

      const response = await axios({
        method: 'POST',
        url: ecocashConfig.currentEndpoints.initiatePayment,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': idempotencyKey
        },
        timeout: 30000
      });

      // Store transaction
      await MobileMoneyTransaction.create({
        transactionId,
        provider: 'ECOCASH',
        providerTransactionId: response.data.transactionId || response.data.referenceId,
        amount,
        phoneNumber: formattedPhone,
        currency,
        status: 'PENDING',
        metadata: {
          requestBody,
          response: response.data,
          paymentUrl: response.data.paymentUrl
        },
        idempotencyKey
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        referenceId: response.data.referenceId,
        paymentUrl: response.data.paymentUrl,
        status: response.data.status,
        message: response.data.message
      };
    } catch (error) {
      logger.error('EcoCash payment initiation failed:', error);
      await this.recordFailedTransaction(transactionId, error, idempotencyKey);
      throw this.handleEcoCashError(error);
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(providerTransactionId, transactionId) {
    ecocashConfig.requireConfigured();

    try {
      const token = await this.getAccessToken();
      const timestamp = ecocashConfig.generateTimestamp();

      const requestBody = {
        merchantId: ecocashConfig.merchantId,
        transactionId: providerTransactionId,
        timestamp
      };

      const signature = ecocashConfig.generateSignature(requestBody, timestamp);
      requestBody.signature = signature;

      const response = await axios({
        method: 'POST',
        url: ecocashConfig.currentEndpoints.queryPayment,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const status = this.mapEcoCashStatus(response.data.status);
      
      await MobileMoneyTransaction.update(
        {
          status,
          providerStatus: response.data.statusDescription,
          completedAt: status === 'COMPLETED' ? new Date() : null,
          metadata: {
            $set: {
              queryResponse: response.data
            }
          }
        },
        { where: { transactionId } }
      );

      return {
        success: status === 'COMPLETED',
        status,
        providerStatus: response.data.status,
        statusDescription: response.data.statusDescription,
        amount: response.data.amount,
        settlementDate: response.data.settlementDate
      };
    } catch (error) {
      logger.error('EcoCash payment query failed:', error);
      throw this.handleEcoCashError(error);
    }
  }

  /**
   * Reverse/Refund payment
   */
  async reversePayment({
    providerTransactionId,
    amount,
    reason,
    transactionId
  }) {
    ecocashConfig.requireConfigured();

    const idempotencyKey = `ecocash_reverse_${transactionId}_${Date.now()}`;

    try {
      const token = await this.getAccessToken();
      const timestamp = ecocashConfig.generateTimestamp();

      const requestBody = {
        merchantId: ecocashConfig.merchantId,
        originalTransactionId: providerTransactionId,
        amount: Math.round(amount * 100),
        reason: reason.substring(0, 200),
        timestamp
      };

      const signature = ecocashConfig.generateSignature(requestBody, timestamp);
      requestBody.signature = signature;

      const response = await axios({
        method: 'POST',
        url: ecocashConfig.currentEndpoints.reversePayment,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': idempotencyKey
        },
        timeout: 30000
      });

      await MobileMoneyTransaction.create({
        transactionId,
        provider: 'ECOCASH',
        providerTransactionId: response.data.reverseTransactionId,
        amount,
        type: 'REFUND',
        status: response.data.status === 'SUCCESS' ? 'COMPLETED' : 'PENDING',
        metadata: {
          originalTransactionId: providerTransactionId,
          response: response.data
        },
        idempotencyKey
      });

      return {
        success: true,
        reverseTransactionId: response.data.reverseTransactionId,
        status: response.data.status,
        message: response.data.message
      };
    } catch (error) {
      logger.error('EcoCash reversal failed:', error);
      throw this.handleEcoCashError(error);
    }
  }

  /**
   * Process webhook callback
   */
  async processWebhook(payload) {
    try {
      // Log webhook
      await PaymentWebhookLog.create({
        provider: 'ECOCASH',
        webhookType: 'payment',
        payload: payload,
        receivedAt: new Date()
      });

      // Validate signature
      if (!this.validateWebhookSignature(payload)) {
        logger.warn('Invalid EcoCash webhook signature');
        throw new ApiError(401, 'Invalid webhook signature', 'INVALID_SIGNATURE');
      }

      const providerTransactionId = payload.transactionId;
      const status = this.mapEcoCashStatus(payload.status);
      const amount = payload.amount / 100; // Convert from cents

      const transaction = await MobileMoneyTransaction.findOne({
        where: {
          providerTransactionId
        }
      });

      if (!transaction) {
        logger.error(`Transaction not found: ${providerTransactionId}`);
        return { success: false, error: 'Transaction not found' };
      }

      await MobileMoneyTransaction.update({
        status,
        providerStatus: payload.statusDescription,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        metadata: {
          ...transaction.metadata,
          webhookResponse: payload,
          settlementDate: payload.settlementDate,
          settlementReference: payload.settlementReference
        }
      }, {
        where: { id: transaction.id }
      });

      logger.info(`EcoCash webhook processed for transaction ${transaction.transactionId}`, {
        providerTransactionId,
        status,
        amount
      });

      return {
        success: true,
        transactionId: transaction.transactionId,
        status,
        amount
      };
    } catch (error) {
      logger.error('Error processing EcoCash webhook:', error);
      throw error;
    }
  }

  /**
   * Format phone number for Lesotho (EcoCash format)
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.toString().replace(/\D/g, '');
    
    // Remove +266 or 266 prefix if present
    if (cleaned.startsWith('266')) {
      cleaned = cleaned.substring(3);
    }
    
    // Ensure 8-digit number with 5 or 6 prefix (EcoCash numbers in Lesotho)
    if (cleaned.length === 8 && (cleaned.startsWith('5') || cleaned.startsWith('6'))) {
      return `266${cleaned}`;
    }
    
    // If already has country code
    if (cleaned.startsWith('266') && cleaned.length === 11) {
      return cleaned;
    }
    
    throw new Error(`Invalid phone number format: ${phoneNumber}`);
  }

  /**
   * Map EcoCash status to internal status
   */
  mapEcoCashStatus(status) {
    const statusMap = {
      'PENDING': 'PENDING',
      'SUCCESS': 'COMPLETED',
      'FAILED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'REVERSED': 'REVERSED',
      'EXPIRED': 'EXPIRED'
    };
    return statusMap[status] || 'PENDING';
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload) {
    const receivedSignature = payload.signature;
    const timestamp = payload.timestamp;
    
    // Remove signature from payload for validation
    const { signature, ...payloadWithoutSignature } = payload;
    const expectedSignature = ecocashConfig.generateSignature(payloadWithoutSignature, timestamp);
    
    return receivedSignature === expectedSignature;
  }

  /**
   * Record failed transaction
   */
  async recordFailedTransaction(transactionId, error, idempotencyKey) {
    try {
      await MobileMoneyTransaction.create({
        transactionId,
        provider: 'ECOCASH',
        status: 'FAILED',
        error: {
          message: error.message,
          code: error.code,
          response: error.response?.data
        },
        idempotencyKey,
        metadata: { error: error.toString() }
      });
    } catch (recordError) {
      logger.error('Failed to record failed transaction:', recordError);
    }
  }

  /**
   * Handle EcoCash specific errors
   */
  handleEcoCashError(error) {
    if (error.response?.data) {
      const ecoError = error.response.data;
      const errorCode = ecoError.errorCode || ecoError.code;
      
      const errorMessages = {
        '1001': 'Invalid merchant ID',
        '1002': 'Invalid API credentials',
        '1003': 'Insufficient balance',
        '1004': 'Invalid amount',
        '1005': 'Invalid phone number',
        '1006': 'Transaction limit exceeded',
        '1007': 'Duplicate transaction',
        '1008': 'Merchant not active',
        '1009': 'Service temporarily unavailable',
        '1010': 'Transaction timeout'
      };

      const message = errorMessages[errorCode] || ecoError.message || 'EcoCash processing failed';
      
      return new ApiError(400, message, 'ECOCASH_ERROR', errorCode);
    }
    
    return new ApiError(500, 'EcoCash service unavailable', 'ECOCASH_SERVICE_ERROR');
  }
}

module.exports = new EcoCashService();
