// src/config/constants.js
export const AppConstants = {
  APP_NAME: 'EasyGo',
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
  
  // Ride constants
  MINIMUM_FARE: 5.00,
  BASE_FARE: 2.50,
  PER_KM_RATE: 1.50,
  PER_MINUTE_RATE: 0.30,
  CANCELLATION_FEE: 3.00,
  
  // Driver constants
  DRIVER_EARNING_PERCENTAGE: 80,
  MAX_DRIVER_DISTANCE_KM: 5,
  DRIVER_WAIT_TIME_MINUTES: 5,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Timeouts
  RIDE_REQUEST_TIMEOUT: 30, // seconds
  DRIVER_RESPONSE_TIMEOUT: 15, // seconds
  SESSION_TIMEOUT: 3600, // seconds
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  
  // Cache keys
  CACHE_KEYS: {
    USER_PROFILE: 'user_profile',
    RIDE_HISTORY: 'ride_history',
    PAYMENT_METHODS: 'payment_methods',
    SAVED_PLACES: 'saved_places',
    NOTIFICATIONS: 'notifications'
  },
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language'
  },
  
  // Map settings
  DEFAULT_LOCATION: {
    lat: -1.286389,
    lng: 36.817223,
    address: 'Nairobi, Kenya'
  },
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  
  // Vehicle types
  VEHICLE_TYPES: {
    ECONOMY: { id: 'economy', name: 'Economy', multiplier: 1.0, icon: 'car' },
    STANDARD: { id: 'standard', name: 'Standard', multiplier: 1.3, icon: 'car' },
    PREMIUM: { id: 'premium', name: 'Premium', multiplier: 1.8, icon: 'car' },
    SUV: { id: 'suv', name: 'SUV', multiplier: 2.0, icon: 'truck' }
  },
  
  // Payment methods
  PAYMENT_METHODS: {
    CARD: 'credit_card',
    MOBILE_MONEY: 'mobile_money',
    WALLET: 'wallet'
  },
  
  // Ride statuses
  RIDE_STATUS: {
    SEARCHING: 'searching',
    DRIVER_ASSIGNED: 'driver_assigned',
    DRIVER_ARRIVED: 'driver_arrived',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
};