// src/services/payment.service.js
import { apiClient } from './api/client';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

class PaymentService {
  async addPaymentMethod(paymentMethodData) {
    try {
      const response = await apiClient.post('/payments/methods', paymentMethodData);
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async getPaymentMethods() {
    try {
      const response = await apiClient.get('/payments/methods');
      return response.data.methods;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async deletePaymentMethod(methodId) {
    try {
      await apiClient.delete(`/payments/methods/${methodId}`);
      return true;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async setDefaultPaymentMethod(methodId) {
    try {
      await apiClient.put(`/payments/methods/${methodId}/default`);
      return true;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async processPayment(paymentData) {
    try {
      const response = await apiClient.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async createPaymentIntent(rideId) {
    try {
      const response = await apiClient.post('/payments/create-intent', { rideId });
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const stripe = await stripePromise;
      const result = await stripe.confirmPayment(paymentIntentId);
      return result;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async getTransactionHistory(filters = {}) {
    try {
      const response = await apiClient.get('/payments/transactions', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async getWalletBalance() {
    try {
      const response = await apiClient.get('/payments/wallet');
      return response.data.balance;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async addFundsToWallet(amount, paymentMethodId) {
    try {
      const response = await apiClient.post('/payments/wallet/add-funds', {
        amount,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async withdrawFromWallet(amount, bankAccountId) {
    try {
      const response = await apiClient.post('/payments/wallet/withdraw', {
        amount,
        bankAccountId
      });
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  async processRefund(transactionId, reason) {
    try {
      const response = await apiClient.post('/payments/refund', {
        transactionId,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  handlePaymentError(error) {
    const errorMap = {
      'insufficient_funds': 'Insufficient funds in your wallet',
      'payment_failed': 'Payment processing failed. Please try a different payment method',
      'invalid_card': 'Invalid card details. Please check and try again',
      'card_declined': 'Your card was declined. Please contact your bank',
      'expired_card': 'Your card has expired. Please update your payment method',
    };
    
    const errorCode = error.response?.data?.code;
    const message = errorMap[errorCode] || error.response?.data?.message || 'Payment processing failed';
    
    return new Error(message);
  }
}

export const paymentService = new PaymentService();