// src/types/api.types.js
export const ApiResponseTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_USER_DATA: 'INVALID_USER_DATA',
  
  // Ride errors
  RIDE_NOT_FOUND: 'RIDE_NOT_FOUND',
  NO_DRIVERS_AVAILABLE: 'NO_DRIVERS_AVAILABLE',
  RIDE_ALREADY_ACTIVE: 'RIDE_ALREADY_ACTIVE',
  INVALID_LOCATION: 'INVALID_LOCATION',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  
  // Driver errors
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  DRIVER_OFFLINE: 'DRIVER_OFFLINE',
  DRIVER_BUSY: 'DRIVER_BUSY',
  DOCUMENTS_PENDING: 'DOCUMENTS_PENDING',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR'
};

export const getErrorMessage = (errorCode) => {
  const messages = {
    [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ErrorCodes.EMAIL_NOT_VERIFIED]: 'Please verify your email address',
    [ErrorCodes.ACCOUNT_LOCKED]: 'Your account has been locked. Contact support',
    [ErrorCodes.TOKEN_EXPIRED]: 'Session expired. Please login again',
    [ErrorCodes.USER_NOT_FOUND]: 'User not found',
    [ErrorCodes.NO_DRIVERS_AVAILABLE]: 'No drivers available in your area',
    [ErrorCodes.RIDE_ALREADY_ACTIVE]: 'You already have an active ride',
    [ErrorCodes.PAYMENT_FAILED]: 'Payment processing failed',
    [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds',
    [ErrorCodes.DRIVER_OFFLINE]: 'Driver is currently offline',
    [ErrorCodes.VALIDATION_ERROR]: 'Please check your input',
    [ErrorCodes.INTERNAL_ERROR]: 'An internal error occurred. Please try again',
    [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable'
  };
  
  return messages[errorCode] || 'An unexpected error occurred';
};