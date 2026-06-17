// src/hooks/usePayment.js
import { useState, useCallback } from 'react';
import { paymentService } from '@/services/payment.service';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const usePayment = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadPaymentMethods = useCallback(async () => {
    setLoading(true);
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (paymentMethodData) => {
    setProcessing(true);
    try {
      const method = await paymentService.addPaymentMethod(paymentMethodData);
      setPaymentMethods(prev => [...prev, method]);
      toast.success('Payment method added successfully');
      return method;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  const deletePaymentMethod = useCallback(async (methodId) => {
    setProcessing(true);
    try {
      await paymentService.deletePaymentMethod(methodId);
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      toast.success('Payment method removed');
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  const setDefaultMethod = useCallback(async (methodId) => {
    setProcessing(true);
    try {
      await paymentService.setDefaultPaymentMethod(methodId);
      setPaymentMethods(prev =>
        prev.map(m => ({ ...m, isDefault: m.id === methodId }))
      );
      toast.success('Default payment method updated');
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  const processPayment = useCallback(async (paymentData) => {
    setProcessing(true);
    try {
      const result = await paymentService.processPayment(paymentData);
      toast.success('Payment processed successfully');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  const loadWalletBalance = useCallback(async () => {
    try {
      const balance = await paymentService.getWalletBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  }, []);

  const addFundsToWallet = useCallback(async (amount, paymentMethodId) => {
    setProcessing(true);
    try {
      const result = await paymentService.addFundsToWallet(amount, paymentMethodId);
      setWalletBalance(prev => prev + amount);
      toast.success(`$${amount} added to wallet`);
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  const loadTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await paymentService.getTransactionHistory(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStripePayment = useCallback(async (rideId) => {
    setProcessing(true);
    try {
      const { clientSecret } = await paymentService.createPaymentIntent(rideId);
      const stripe = await stripePromise;
      
      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    paymentMethods,
    transactions,
    walletBalance,
    loading,
    processing,
    loadPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultMethod,
    processPayment,
    loadWalletBalance,
    addFundsToWallet,
    loadTransactions,
    handleStripePayment,
  };
};