// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request';
      case 401:
        return 'Unauthorized. Please login again';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return data.message || 'Resource not found';
      case 409:
        return data.message || 'Conflict with current state';
      case 422:
        return data.message || 'Validation failed';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export class AppError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}