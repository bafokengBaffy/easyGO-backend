const axios = require('axios');
const logger = require('../utils/logger');
const { BadRequestException } = require('../exceptions/api.exception');
const { Payment, Ride } = require('../models');
const socketService = require('./socketService');

class MpesaService {
  constructor() {
    this.baseUrl = process.env.MPESA_API_URL;
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortCode = process.env.MPESA_SHORTCODE;
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      return response.data.access_token;
    } catch (error) {
      logger.error('M-Pesa Auth Error', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  async stkPush({ phoneNumber, amount, accountReference, transactionDesc, transactionId }) {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    const payload = {
      BusinessShortCode: this.shortCode,
      Password: Buffer.from(`${this.shortCode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64'),
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber.replace('+', ''),
      PartyB: this.shortCode,
      PhoneNumber: phoneNumber.replace('+', ''),
      CallBackURL: `${process.env.API_BASE_URL}/v1/webhooks/mpesa`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
      ExternalReference: transactionId
    };

    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error('M-Pesa STK Push Error', error.response?.data || error.message);
      throw new BadRequestException('M-Pesa payment initiation failed');
    }
  }

  async queryStkStatus(checkoutRequestId) {
    // Implementation for checking transaction status via M-Pesa Query API
    return { status: 'PENDING', checkoutRequestId };
  }

  async handleWebhook(payload) {
    logger.info('M-Pesa Webhook Received', payload);
    
    const { Body } = payload;
    if (!Body || !Body.stkCallback) {
      logger.warn('Invalid M-Pesa webhook payload structure');
      return;
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
    
    // Map M-Pesa ResultCode to internal status
    // ResultCode 0 represents success
    const status = ResultCode === 0 ? 'COMPLETED' : 'FAILED';

    const payment = await Payment.findOne({ 
      where: { transaction_id: CheckoutRequestID },
      include: [{ model: Ride, as: 'ride' }]
    });
    
    if (payment) {
      await payment.update({ status });

      if (status === 'COMPLETED' && payment.ride) {
        await payment.ride.update({ status: 'confirmed' });
        
        // Notify the Rider via Socket
        socketService.io.to(`user:${payment.ride.rider_id}`).emit('payment:confirmed', {
          rideId: payment.ride.id,
          amount: payment.amount,
          method: 'M-Pesa'
        });
      }
      
      logger.info(`M-Pesa update: Payment ${payment.id} is ${status}`);
    } else {
      logger.warn(`No payment record found for M-Pesa CheckoutRequestID: ${CheckoutRequestID}`);
    }
  }

  /**
   * Process B2C (Business to Customer) payment
   */
  async b2cPayment({ phoneNumber, amount, commandId, remarks, occasion, transactionId }) {
    const token = await this.getAccessToken();
    
    const payload = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: commandId || 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: phoneNumber.replace('+', ''),
      Remarks: remarks || 'EasyGo Payout',
      QueueTimeOutURL: `${process.env.API_BASE_URL}/v1/webhooks/mpesa/timeout`,
      ResultURL: `${process.env.API_BASE_URL}/v1/webhooks/mpesa/b2c-result`,
      Occasion: occasion || 'Payout',
      OriginatorConversationID: transactionId
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/b2c/v1/paymentrequest`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error('M-Pesa B2C Error', error.response?.data || error.message);
      throw new Error('M-Pesa payout failed');
    }
  }

  /**
   * Reverse a transaction
   */
  async reverseTransaction({ transactionId, amount, receiverParty, remarks, occasion }) {
    const token = await this.getAccessToken();
    
    const payload = {
      CommandID: 'TransactionReversal',
      Amount: Math.round(amount),
      ReceiverParty: receiverParty,
      ReceiverIdentifierType: '1',
      Remarks: remarks || 'Transaction reversal',
      QueueTimeOutURL: `${process.env.API_BASE_URL}/v1/webhooks/mpesa/reversal-timeout`,
      ResultURL: `${process.env.API_BASE_URL}/v1/webhooks/mpesa/reversal-result`,
      Occasion: occasion || `Reverse of ${transactionId}`,
      OriginalTransactionID: transactionId,
      Initiator: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/reversal/v1/request`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error('M-Pesa Reversal Error', error.response?.data || error.message);
      throw new Error('M-Pesa reversal failed');
    }
  }
}

module.exports = new MpesaService();