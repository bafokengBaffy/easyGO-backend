// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Custom hook for API calls with proper loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - React Query options
 */
export function useApi(apiFunction, options = {}) {
  const {
    onSuccess,
    onError,
    showToast = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryFn: apiFunction,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions,
    onSuccess: (data) => {
      if (showToast && options.successMessage) {
        toast.success(options.successMessage);
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      if (showToast) {
        toast.error(errorMessage);
      }
      onError?.(error);
    },
  });
}

/**
 * Custom hook for API mutations
 * @param {Function} mutationFunction - The mutation function
 * @param {Object} options - React Query mutation options
 */
export function useMutation(mutationFunction, options = {}) {
  const {
    onSuccess,
    onError,
    showToast = true,
    successMessage = 'Operation successful',
    errorMessage = 'Operation failed',
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: mutationFunction,
    ...mutationOptions,
    onSuccess: (data) => {
      if (showToast) {
        toast.success(successMessage);
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      const message = error.response?.data?.message || errorMessage;
      if (showToast) {
        toast.error(message);
      }
      onError?.(error);
    },
  });
}

/**
 * Hook for lazy loading (like useLazyQuery)
 */
export function useLazyApi(apiFunction, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return [execute, { data, loading, error }];
}
