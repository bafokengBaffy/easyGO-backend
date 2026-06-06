/**
 * M-Pesa Lesotho Payment Service
 * Handles STK Push, B2C, B2B, and transaction queries
 * @module services/mpesa.service
 */

const axios = require('axios');
const crypto = require('crypto');
const mpesaConfig = require('../config/mpesa');
const logger = require('../utils/logger');
const { MobileMoneyTransaction, PaymentWebhookLog } = require('../models');
const idempotency = require('../utils/transactionIdempotency');
const { ApiError } = require('../utils/apiError');
const redisClient = require('../config/redis');

class MpesaService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
  }

  /**
   * Get OAuth token with caching and auto-refresh
   */
  async getAccessToken() {
    try {
      mpesaConfig.requireConfigured();

      // Check if token exists and not expired (with 5 min buffer)
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
        return this.accessToken;
      }

      logger.info('Fetching new M-Pesa access token');

      const response = await axios({
        method: 'GET',
        url: mpesaConfig.currentEndpoints.auth,
        headers: {
          Authorization: mpesaConfig.getAuthHeader()
        },
        timeout: 30000
      });

      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid token response from M-Pesa');
      }

      this.accessToken = response.data.access_token;
      // Token expires in 3600 seconds, set expiry to 3500 seconds for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in || 3600) * 1000 - 60000;

      logger.info('M-Pesa access token obtained successfully');

      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get M-Pesa access token:', error);
      throw new ApiError(500, 'M-Pesa authentication failed', 'MPESA_AUTH_ERROR');
    }
  }

  /**
   * Initiate STK Push (Customer to Business)
   */
  async stkPush({
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
    transactionId,
    callbackUrl = null
  }) {
    mpesaConfig.requireConfigured();

    const idempotencyKey = `${transactionId}_${Date.now()}`;
    
    // Check for duplicate transaction
    const isDuplicate = await idempotency.check(idempotencyKey);
    if (isDuplicate) {
      logger.warn(`Duplicate STK Push request prevented: ${idempotencyKey}`);
      throw new ApiError(409, 'Duplicate transaction detected', 'DUPLICATE_TRANSACTION');
    }

    try {
      const token = await this.getAccessToken();
      
      // Format phone number (remove + or 00 prefix, ensure 254 format for Lesotho?)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const timestamp = mpesaConfig.generateTimestamp();
      const password = mpesaConfig.getStkPushPassword(timestamp);

      const requestBody = {
        BusinessShortCode: mpesaConfig.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: mpesaConfig.transactionTypes.CUSTOMER_PAY_BILL_ONLINE,
        Amount: Math.round(amount), // Ensure integer
        PartyA: formattedPhone,
        PartyB: mpesaConfig.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl || `${mpesaConfig.callbackBaseUrl}/api/v1/webhooks/mpesa/result`,
        AccountReference: accountReference.substring(0, 12),
        TransactionDesc: transactionDesc.substring(0, 13)
      };

      logger.info(`Initiating M-Pesa STK Push for transaction ${transactionId}`, {
        phoneNumber: formattedPhone,
        amount,
        accountReference
      });

      const response = await this.makeRequest({
        method: 'POST',
        url: mpesaConfig.currentEndpoints.stkPush,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, idempotencyKey);

      // Store transaction record
      await MobileMoneyTransaction.create({
        transactionId,
        provider: 'MPESA',
        providerTransactionId: response.data.CheckoutRequestID,
        amount,
        phoneNumber: formattedPhone,
        status: 'PENDING',
        metadata: {
          requestBody,
          response: response.data,
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID
        },
        idempotencyKey
      });

      // Start polling for status
      this.startPolling(response.data.CheckoutRequestID, transactionId);

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error) {
      logger.error('M-Pesa STK Push failed:', error);
      await this.recordFailedTransaction(transactionId, error, idempotencyKey);
      throw this.handleMpesaError(error);
    }
  }

  /**
   * Query STK Push status
   */
  async queryStkStatus(checkoutRequestId, transactionId) {
    mpesaConfig.requireConfigured();

    try {
      const token = await this.getAccessToken();
      const timestamp = mpesaConfig.generateTimestamp();
      const password = mpesaConfig.getStkPushPassword(timestamp);

      const requestBody = {
        BusinessShortCode: mpesaConfig.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await this.makeRequest({
        method: 'POST',
        url: mpesaConfig.currentEndpoints.stkQuery,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const status = this.mapStkStatus(response.data.ResultCode);
      
      // Update transaction status
      await MobileMoneyTransaction.update(
        {
          status,
          providerStatus: response.data.ResultDesc,
          completedAt: status === 'COMPLETED' ? new Date() : null,
          metadata: {
            $set: {
              'queryResponse': response.data
            }
          }
        },
        { where: { transactionId } }
      );

      return {
        success: status === 'COMPLETED',
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        status
      };
    } catch (error) {
      logger.error('M-Pesa STK query failed:', error);
      throw this.handleMpesaError(error);
    }
  }

  /**
   * B2C Payment (Business to Customer)
   */
  async b2cPayment({
    phoneNumber,
    amount,
    commandId = 'BusinessPayment',
    remarks,
    occasion,
    transactionId
  }) {
    mpesaConfig.requireConfigured();

    const idempotencyKey = `b2c_${transactionId}_${Date.now()}`;
    
    const isDuplicate = await idempotency.check(idempotencyKey);
    if (isDuplicate) {
      throw new ApiError(409, 'Duplicate B2C transaction', 'DUPLICATE_TRANSACTION');
    }

    try {
      const token = await this.getAccessToken();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody = {
        InitiatorName: mpesaConfig.initiatorName,
        SecurityCredential: await this.getSecurityCredential(),
        CommandID: mpesaConfig.b2cCommandIds[commandId] || 'BusinessPayment',
        Amount: Math.round(amount),
        PartyA: mpesaConfig.shortcode,
        PartyB: formattedPhone,
        Remarks: remarks.substring(0, 100),
        QueueTimeOutURL: mpesaConfig.timeoutUrl,
        ResultURL: mpesaConfig.resultUrl,
        Occasion: occasion ? occasion.substring(0, 100) : ''
      };

      const response = await this.makeRequest({
        method: 'POST',
        url: mpesaConfig.currentEndpoints.b2c,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, idempotencyKey);

      await MobileMoneyTransaction.create({
        transactionId,
        provider: 'MPESA',
        providerTransactionId: response.data.ConversationID,
        amount,
        phoneNumber: formattedPhone,
        type: 'B2C',
        status: 'PENDING',
        metadata: {
          requestBody,
          response: response.data,
          conversationId: response.data.ConversationID,
          originatorConversationId: response.data.OriginatorConversationID
        },
        idempotencyKey
      });

      return {
        success: true,
        conversationId: response.data.ConversationID,
        originatorConversationId: response.data.OriginatorConversationID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription
      };
    } catch (error) {
      logger.error('M-Pesa B2C payment failed:', error);
      await this.recordFailedTransaction(transactionId, error, idempotencyKey);
      throw this.handleMpesaError(error);
    }
  }

  /**
   * Transaction Reversal
   */
  async reverseTransaction({
    transactionId,
    amount,
    receiverParty,
    receiverIdentifierType = '1',
    remarks,
    occasion
  }) {
    mpesaConfig.requireConfigured();

    const idempotencyKey = `reversal_${transactionId}_${Date.now()}`;

    try {
      const token = await this.getAccessToken();

      const requestBody = {
        CommandID: 'TransactionReversal',
        Initiator: mpesaConfig.initiatorName,
        SecurityCredential: await this.getSecurityCredential(),
        CommandID: 'TransactionReversal',
        ReceiverParty: receiverParty,
        RecieverIdentifierType: receiverIdentifierType,
        Amount: Math.round(amount),
        Remarks: remarks.substring(0, 100),
        QueueTimeOutURL: mpesaConfig.timeoutUrl,
        ResultURL: mpesaConfig.resultUrl,
        Occasion: occasion ? occasion.substring(0, 100) : ''
      };

      const response = await this.makeRequest({
        method: 'POST',
        url: mpesaConfig.currentEndpoints.reversal,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, idempotencyKey);

      return {
        success: true,
        conversationId: response.data.ConversationID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription
      };
    } catch (error) {
      logger.error('M-Pesa reversal failed:', error);
      throw this.handleMpesaError(error);
    }
  }

  /**
   * Process webhook callback from M-Pesa
   */
  async processWebhook(payload, webhookType = 'result') {
    try {
      // Log incoming webhook
      await PaymentWebhookLog.create({
        provider: 'MPESA',
        webhookType,
        payload: payload,
        receivedAt: new Date()
      });

      // Validate signature/security
      if (!this.validateWebhookSignature(payload)) {
        logger.warn('Invalid M-Pesa webhook signature');
        throw new ApiError(401, 'Invalid webhook signature', 'INVALID_SIGNATURE');
      }

      const resultCode = payload.ResultCode;
      const resultDesc = payload.ResultDesc;
      const checkoutRequestId = payload.CheckoutRequestID || payload.ConversationID;
      
      // Find transaction
      const transaction = await MobileMoneyTransaction.findOne({
        where: {
          providerTransactionId: checkoutRequestId
        }
      });

      if (!transaction) {
        logger.error(`Transaction not found for webhook: ${checkoutRequestId}`);
        return { success: false, error: 'Transaction not found' };
      }

      let status;
      if (resultCode === '0') {
        status = 'COMPLETED';
        
        // Extract additional payment details
        const callbackMetadata = payload.CallbackMetadata;
        if (callbackMetadata) {
          const receiptNumber = this.extractMetadataItem(callbackMetadata.Item, 'ReceiptNumber');
          const transactionDate = this.extractMetadataItem(callbackMetadata.Item, 'TransactionDate');
          
          await MobileMoneyTransaction.update({
            status,
            providerStatus: resultDesc,
            completedAt: new Date(),
            metadata: {
              ...transaction.metadata,
              webhookResponse: payload,
              receiptNumber,
              transactionDate
            }
          }, {
            where: { id: transaction.id }
          });
        }
      } else if (resultCode === '1037') {
        status = 'CANCELLED';
        await MobileMoneyTransaction.update({
          status,
          providerStatus: resultDesc,
          metadata: {
            ...transaction.metadata,
            webhookResponse: payload,
            cancellationReason: resultDesc
          }
        }, {
          where: { id: transaction.id }
        });
      } else {
        status = 'FAILED';
        await MobileMoneyTransaction.update({
          status,
          providerStatus: resultDesc,
          metadata: {
            ...transaction.metadata,
            webhookResponse: payload,
            errorCode: resultCode,
            errorDescription: resultDesc
          }
        }, {
          where: { id: transaction.id }
        });
      }

      logger.info(`M-Pesa webhook processed for transaction ${transaction.transactionId}`, {
        checkoutRequestId,
        resultCode,
        status
      });

      return {
        success: true,
        transactionId: transaction.transactionId,
        status,
        resultCode,
        resultDesc
      };
    } catch (error) {
      logger.error('Error processing M-Pesa webhook:', error);
      throw error;
    }
  }

  /**
   * Format phone number to international format (Lesotho: +266)
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.toString().replace(/\D/g, '');
    
    // Remove country code if present
    if (cleaned.startsWith('266')) {
      cleaned = cleaned.substring(3);
    }
    
    // Ensure 8-digit local number
    if (cleaned.length === 8) {
      return `266${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Get security credential (encrypted initiator password)
   */
  async getSecurityCredential() {
    // This should be implemented with proper encryption
    // For production, use the actual certificate provided by Safaricom
    const publicCert = process.env.MPESA_PUBLIC_CERT;
    const encrypted = crypto.publicEncrypt(publicCert, Buffer.from(mpesaConfig.initiatorPassword));
    return encrypted.toString('base64');
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(requestConfig, idempotencyKey = null) {
    let lastError;
    let delay = this.retryConfig.baseDelay;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await axios({
          ...requestConfig,
          timeout: 30000,
          headers: {
            ...requestConfig.headers,
            'X-Request-ID': idempotencyKey || crypto.randomUUID()
          }
        });

        if (idempotencyKey) {
          await idempotency.record(idempotencyKey);
        }

        return response;
      } catch (error) {
        lastError = error;
        
        if (error.response?.status === 429 || error.code === 'ECONNRESET') {
          if (attempt === this.retryConfig.maxRetries) break;
          
          logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt}/${this.retryConfig.maxRetries})`);
          await this.sleep(delay);
          delay = Math.min(delay * 2, this.retryConfig.maxDelay);
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Start polling for STK push status
   */
  async startPolling(checkoutRequestId, transactionId) {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds
    const interval = 2000; // 2 seconds

    const poll = setInterval(async () => {
      attempts++;
      
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        await MobileMoneyTransaction.update(
          { status: 'TIMEOUT' },
          { where: { transactionId } }
        );
        return;
      }

      const status = await this.queryStkStatus(checkoutRequestId, transactionId);
      if (status.status === 'COMPLETED' || status.status === 'FAILED' || status.status === 'CANCELLED') {
        clearInterval(poll);
      }
    }, interval);
  }

  /**
   * Map STK result code to status
   */
  mapStkStatus(resultCode) {
    const statusMap = {
      '0': 'COMPLETED',
      '1037': 'CANCELLED',
      '1032': 'FAILED',
      '1001': 'FAILED',
      '1006': 'FAILED'
    };
    return statusMap[resultCode] || 'PENDING';
  }

  /**
   * Extract metadata item from callback
   */
  extractMetadataItem(items, name) {
    const item = items.find(i => i.Name === name);
    return item ? item.Value : null;
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload) {
    // Implement signature validation based on M-Pesa specs
    // For now, basic validation
    return payload && (payload.ResultCode !== undefined);
  }

  /**
   * Record failed transaction
   */
  async recordFailedTransaction(transactionId, error, idempotencyKey) {
    try {
      await MobileMoneyTransaction.create({
        transactionId,
        provider: 'MPESA',
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
   * Handle M-Pesa specific errors
   */
  handleMpesaError(error) {
    if (error.response?.data) {
      const mpesaError = error.response.data;
      const errorCode = mpesaError.errorCode || mpesaError.ResponseCode;
      
      const errorMessages = {
        '500.001': 'Invalid consumer key/secret',
        '500.002': 'Insufficient balance',
        '500.003': 'Transaction amount exceeds limit',
        '500.004': 'Invalid phone number',
        '500.005': 'Merchant not configured',
        '500.006': 'Transaction already completed',
        '500.007': 'Network timeout',
        '500.008': 'STK push failed'
      };

      const message = errorMessages[errorCode] || mpesaError.errorMessage || 'M-Pesa processing failed';
      
      return new ApiError(400, message, 'MPESA_ERROR', errorCode);
    }
    
    return new ApiError(500, 'M-Pesa service unavailable', 'MPESA_SERVICE_ERROR');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new MpesaService();
