/**
 * Driver Routes
 * Version: 2.0.0
 * Description: Driver-specific endpoints for ride-sharing platform
 * 
 * @module routes/v1/driverRoutes
 * @requires express
 * @requires controllers/driverController
 * @requires middleware/auth
 * @requires middleware/validate
 * @requires middleware/driver.validation
 * @requires middleware/cache
 * @requires middleware/rateLimiter
 * @requires middleware/requestLogger
 */

const express = require('express');
const router = express.Router();

// Controllers
const driverController = require('../../controllers/driverController');

// Middleware
const { auth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const driverValidation = require('../../middleware/driver.validation');
const { cacheMiddleware } = require('../../middleware/cache');
const { rateLimiter } = require('../../middleware/rateLimiter');
const { requestLogger } = require('../../middleware/requestLogger');
const { upload } = require('../../utils/fileUpload');

/**
 * Apply authentication to all driver routes
 * All driver operations require authentication
 */
router.use(auth, requestLogger);

// =============================================================================
// DRIVER PROFILE MANAGEMENT
// =============================================================================

/**
 * @route GET /api/v1/drivers/profile
 * @description Get current driver's profile
 * @access Driver only
 * @cache 30 seconds
 * 
 * @returns {Object} Driver profile with vehicle and verification details
 * 
 * @example
 * GET /api/v1/drivers/profile
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Response: {
 *   "success": true,
 *   "data": {
 *     "id": "drv_123",
 *     "name": "John Driver",
 *     "email": "driver@example.com",
 *     "status": "online",
 *     "verification": { "status": "verified", "documents": [...] },
 *     "vehicle": { "id": "veh_123", "make": "Toyota", "model": "Camry" },
 *     "rating": 4.8,
 *     "totalRides": 150,
 *     "earnings": 1250.50
 *   }
 * }
 */
router.get(
  '/profile',
  cacheMiddleware({ ttl: 30 }),
  driverController.getProfile
);

/**
 * @route PUT /api/v1/drivers/profile
 * @description Update driver profile
 * @access Driver only
 * 
 * @body {string} [name] - Driver's full name
 * @body {string} [phone] - Driver's phone number
 * @body {Object} [preferences] - Driver preferences
 * @body {Object} [settings] - Driver settings
 * 
 * @returns {Object} Updated driver profile
 * 
 * @example
 * PUT /api/v1/drivers/profile
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "name": "John Driver Jr.", "preferences": { "notifications": true } }
 */
router.put(
  '/profile',
  validate(driverValidation.updateProfile),
  driverController.updateProfile
);

// =============================================================================
// STATUS MANAGEMENT
// =============================================================================

/**
 * @route PATCH /api/v1/drivers/status
 * @description Update driver online/offline status
 * @access Driver only
 * 
 * @body {string} status - Status to set (online/offline/busy)
 * @body {Object} [location] - Current driver location
 * @body {number} location.latitude - Current latitude
 * @body {number} location.longitude - Current longitude
 * 
 * @returns {Object} Updated driver status
 * 
 * @example
 * PATCH /api/v1/drivers/status
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: {
 *   "status": "online",
 *   "location": { "latitude": 34.05, "longitude": -118.25 }
 * }
 */
router.patch(
  '/status',
  validate(driverValidation.updateStatus),
  driverController.setOnlineStatus
);

/**
 * @route GET /api/v1/drivers/status
 * @description Get current driver status
 * @access Driver only
 * 
 * @returns {Object} Current driver status and location
 * 
 * @example
 * GET /api/v1/drivers/status
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get(
  '/status',
  cacheMiddleware({ ttl: 10 }),
  driverController.getStatus
);

// =============================================================================
// VEHICLE MANAGEMENT
// =============================================================================

/**
 * @route GET /api/v1/drivers/vehicle
 * @description Get driver's vehicle details
 * @access Driver only
 * @cache 1 minute
 * 
 * @returns {Object} Vehicle details
 * 
 * @example
 * GET /api/v1/drivers/vehicle
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get(
  '/vehicle',
  cacheMiddleware({ ttl: 60 }),
  driverController.getVehicle
);

/**
 * @route PUT /api/v1/drivers/vehicle
 * @description Update driver's vehicle details
 * @access Driver only
 * 
 * @body {string} [make] - Vehicle make
 * @body {string} [model] - Vehicle model
 * @body {string} [year] - Vehicle year
 * @body {string} [licensePlate] - License plate number
 * @body {string} [color] - Vehicle color
 * @body {number} [capacity] - Passenger capacity
 * 
 * @returns {Object} Updated vehicle details
 * 
 * @example
 * PUT /api/v1/drivers/vehicle
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "make": "Toyota", "model": "Camry", "year": "2020" }
 */
router.put(
  '/vehicle',
  validate(driverValidation.updateVehicle),
  driverController.updateVehicle
);

/**
 * @route POST /api/v1/drivers/vehicle/documents
 * @description Upload vehicle documents
 * @access Driver only
 * 
 * @formData {File} registration - Vehicle registration document
 * @formData {File} insurance - Insurance document
 * @formData {File} inspection - Vehicle inspection report
 * @formData {string} [notes] - Additional notes
 * 
 * @returns {Object} Uploaded document details
 * 
 * @example
 * POST /api/v1/drivers/vehicle/documents
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Content-Type: multipart/form-data
 * formData: { "registration": [file], "insurance": [file] }
 */
router.post(
  '/vehicle/documents',
  upload.fields([
    { name: 'registration', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'inspection', maxCount: 1 }
  ]),
  validate(driverValidation.uploadDocuments),
  driverController.uploadVehicleDocuments
);

// =============================================================================
// RIDE MANAGEMENT
// =============================================================================

/**
 * @route GET /api/v1/drivers/rides
 * @description Get driver's ride history
 * @access Driver only
 * 
 * @queryParam {number} [page=1] - Page number
 * @queryParam {number} [limit=20] - Items per page
 * @queryParam {string} [status] - Filter by ride status
 * @queryParam {string} [startDate] - Start date filter
 * @queryParam {string} [endDate] - End date filter
 * 
 * @returns {Object} Paginated ride history
 * 
 * @example
 * GET /api/v1/drivers/rides?page=1&limit=10&status=completed
 */
router.get(
  '/rides',
  validate(driverValidation.getRideHistory),
  driverController.getRideHistory
);

/**
 * @route GET /api/v1/drivers/rides/current
 * @description Get current ride details
 * @access Driver only
 * 
 * @returns {Object} Current ride details or null if no active ride
 * 
 * @example
 * GET /api/v1/drivers/rides/current
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get(
  '/rides/current',
  driverController.getCurrentRide
);

/**
 * @route PUT /api/v1/drivers/rides/:rideId/accept
 * @description Accept a ride request
 * @access Driver only
 * @rateLimit 30 requests per minute
 * 
 * @param {string} rideId - Ride ID
 * @body {Object} [location] - Driver's current location
 * 
 * @returns {Object} Updated ride details
 * 
 * @example
 * PUT /api/v1/drivers/rides/rid_123/accept
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "location": { "latitude": 34.05, "longitude": -118.25 } }
 */
router.put(
  '/rides/:rideId/accept',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many ride acceptance attempts, please slow down'
  }),
  validate(driverValidation.acceptRide),
  driverController.acceptRide
);

/**
 * @route PUT /api/v1/drivers/rides/:rideId/start
 * @description Start a ride
 * @access Driver only
 * 
 * @param {string} rideId - Ride ID
 * @body {Object} [location] - Starting location
 * 
 * @returns {Object} Updated ride details
 * 
 * @example
 * PUT /api/v1/drivers/rides/rid_123/start
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.put(
  '/rides/:rideId/start',
  validate(driverValidation.startRide),
  driverController.startRide
);

/**
 * @route PUT /api/v1/drivers/rides/:rideId/complete
 * @description Complete a ride
 * @access Driver only
 * 
 * @param {string} rideId - Ride ID
 * @body {Object} [location] - Ending location
 * @body {number} [distance] - Total distance traveled
 * @body {number} [duration] - Total ride duration
 * 
 * @returns {Object} Updated ride details with fare breakdown
 * 
 * @example
 * PUT /api/v1/drivers/rides/rid_123/complete
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "distance": 5.2, "duration": 15 }
 */
router.put(
  '/rides/:rideId/complete',
  validate(driverValidation.completeRide),
  driverController.completeRide
);

/**
 * @route PUT /api/v1/drivers/rides/:rideId/cancel
 * @description Cancel a ride
 * @access Driver only
 * 
 * @param {string} rideId - Ride ID
 * @body {string} reason - Cancellation reason
 * @body {Object} [location] - Driver's location
 * 
 * @returns {Object} Cancellation confirmation
 * 
 * @example
 * PUT /api/v1/drivers/rides/rid_123/cancel
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "reason": "Vehicle issue" }
 */
router.put(
  '/rides/:rideId/cancel',
  validate(driverValidation.cancelRide),
  driverController.cancelRide
);

// =============================================================================
// AVAILABILITY & MATCHING
// =============================================================================

/**
 * @route GET /api/v1/drivers/available-rides
 * @description Get available rides in driver's area
 * @access Driver only
 * 
 * @queryParam {number} [latitude] - Driver's latitude (optional, uses current location if not provided)
 * @queryParam {number} [longitude] - Driver's longitude (optional)
 * @queryParam {number} [radius=10] - Search radius in kilometers
 * @queryParam {number} [limit=20] - Maximum number of rides to return
 * 
 * @returns {Object} List of available rides
 * 
 * @example
 * GET /api/v1/drivers/available-rides?latitude=34.05&longitude=-118.25&radius=5
 */
router.get(
  '/available-rides',
  validate(driverValidation.getAvailableRides),
  driverController.getAvailableRides
);

/**
 * @route POST /api/v1/drivers/available-rides/driver-matching
 * @description Get ride matching suggestions
 * @access Driver only
 * 
 * @body {number} latitude - Driver's current latitude
 * @body {number} longitude - Driver's current longitude
 * @body {number} [radius=10] - Search radius in kilometers
 * @body {string} [preference] - Matching preference (speed/revenue/rating)
 * 
 * @returns {Object} Matching suggestions with priority
 * 
 * @example
 * POST /api/v1/drivers/available-rides/driver-matching
 * Body: { "latitude": 34.05, "longitude": -118.25, "preference": "revenue" }
 */
router.post(
  '/available-rides/driver-matching',
  validate(driverValidation.getMatchingSuggestions),
  driverController.getMatchingSuggestions
);

// =============================================================================
// EARNINGS & FINANCIALS
// =============================================================================

/**
 * @route GET /api/v1/drivers/earnings
 * @description Get driver earnings summary
 * @access Driver only
 * 
 * @queryParam {string} [period=week] - Earnings period (day/week/month/year)
 * @queryParam {string} [startDate] - Start date for custom period
 * @queryParam {string} [endDate] - End date for custom period
 * 
 * @returns {Object} Earnings summary with breakdown
 * 
 * @example
 * GET /api/v1/drivers/earnings?period=month
 */
router.get(
  '/earnings',
  validate(driverValidation.getEarnings),
  cacheMiddleware({ ttl: 60 }),
  driverController.getEarnings
);

/**
 * @route GET /api/v1/drivers/earnings/details
 * @description Get detailed earnings breakdown
 * @access Driver only
 * 
 * @queryParam {string} [period=week] - Earnings period
 * @queryParam {string} [startDate] - Start date
 * @queryParam {string} [endDate] - End date
 * 
 * @returns {Object} Detailed earnings breakdown by ride
 * 
 * @example
 * GET /api/v1/drivers/earnings/details?period=week
 */
router.get(
  '/earnings/details',
  validate(driverValidation.getEarningsDetails),
  driverController.getEarningsDetails
);

/**
 * @route GET /api/v1/drivers/earnings/payout-history
 * @description Get payout history
 * @access Driver only
 * 
 * @queryParam {number} [page=1] - Page number
 * @queryParam {number} [limit=20] - Items per page
 * @queryParam {string} [status] - Filter by payout status
 * 
 * @returns {Object} Paginated payout history
 * 
 * @example
 * GET /api/v1/drivers/earnings/payout-history?page=1&status=completed
 */
router.get(
  '/earnings/payout-history',
  validate(driverValidation.getPayoutHistory),
  driverController.getPayoutHistory
);

// =============================================================================
// RATING & REVIEWS
// =============================================================================

/**
 * @route GET /api/v1/drivers/ratings
 * @description Get driver's rating summary
 * @access Driver only
 * 
 * @returns {Object} Rating summary with distribution
 * 
 * @example
 * GET /api/v1/drivers/ratings
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get(
  '/ratings',
  cacheMiddleware({ ttl: 300 }),
  driverController.getRatings
);

/**
 * @route GET /api/v1/drivers/reviews
 * @description Get driver's reviews
 * @access Driver only
 * 
 * @queryParam {number} [page=1] - Page number
 * @queryParam {number} [limit=20] - Items per page
 * @queryParam {number} [minRating] - Minimum rating filter
 * @queryParam {number} [maxRating] - Maximum rating filter
 * 
 * @returns {Object} Paginated reviews
 * 
 * @example
 * GET /api/v1/drivers/reviews?page=1&minRating=4
 */
router.get(
  '/reviews',
  validate(driverValidation.getReviews),
  driverController.getReviews
);

// =============================================================================
// DOCUMENT MANAGEMENT
// =============================================================================

/**
 * @route GET /api/v1/drivers/documents
 * @description Get driver's documents
 * @access Driver only
 * 
 * @returns {Object} List of documents with verification status
 * 
 * @example
 * GET /api/v1/drivers/documents
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get(
  '/documents',
  driverController.getDocuments
);

/**
 * @route POST /api/v1/drivers/documents
 * @description Upload driver documents
 * @access Driver only
 * 
 * @formData {File} [license] - Driver's license
 * @formData {File} [id] - National ID or passport
 * @formData {File} [profilePhoto] - Profile photo
 * @formData {string} [documentType] - Type of document
 * 
 * @returns {Object} Uploaded document details
 * 
 * @example
 * POST /api/v1/drivers/documents
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Content-Type: multipart/form-data
 * formData: { "license": [file], "id": [file] }
 */
router.post(
  '/documents',
  upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'id', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
  ]),
  validate(driverValidation.uploadDocuments),
  driverController.uploadDocuments
);

/**
 * @route DELETE /api/v1/drivers/documents/:id
 * @description Delete a driver document
 * @access Driver only
 * 
 * @param {string} id - Document ID
 * @returns {Object} Deletion confirmation
 * 
 * @example
 * DELETE /api/v1/drivers/documents/doc_123
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.delete(
  '/documents/:id',
  validate(driverValidation.deleteDocument),
  driverController.deleteDocument
);

// =============================================================================
// NOTIFICATIONS & SETTINGS
// =============================================================================

/**
 * @route GET /api/v1/drivers/notifications
 * @description Get driver's notifications
 * @access Driver only
 * 
 * @queryParam {number} [page=1] - Page number
 * @queryParam {number} [limit=20] - Items per page
 * @queryParam {boolean} [unreadOnly] - Only unread notifications
 * 
 * @returns {Object} Paginated notifications
 * 
 * @example
 * GET /api/v1/drivers/notifications?unreadOnly=true
 */
router.get(
  '/notifications',
  validate(driverValidation.getNotifications),
  driverController.getNotifications
);

/**
 * @route PATCH /api/v1/drivers/notifications/:id/read
 * @description Mark notification as read
 * @access Driver only
 * 
 * @param {string} id - Notification ID
 * @returns {Object} Updated notification
 * 
 * @example
 * PATCH /api/v1/drivers/notifications/not_123/read
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.patch(
  '/notifications/:id/read',
  validate(driverValidation.markNotificationRead),
  driverController.markNotificationRead
);

/**
 * @route PUT /api/v1/drivers/settings
 * @description Update driver settings
 * @access Driver only
 * 
 * @body {Object} [notificationPreferences] - Notification preferences
 * @body {Object} [ridePreferences] - Ride preferences
 * @body {Object} [privacySettings] - Privacy settings
 * 
 * @returns {Object} Updated settings
 * 
 * @example
 * PUT /api/v1/drivers/settings
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "notificationPreferences": { "newRide": true, "reminder": false } }
 */
router.put(
  '/settings',
  validate(driverValidation.updateSettings),
  driverController.updateSettings
);

// =============================================================================
// GEOLOCATION & TRACKING
// =============================================================================

/**
 * @route POST /api/v1/drivers/location
 * @description Update driver's current location
 * @access Driver only
 * 
 * @body {number} latitude - Current latitude
 * @body {number} longitude - Current longitude
 * @body {number} [accuracy] - Location accuracy in meters
 * @body {number} [heading] - Heading in degrees
 * @body {number} [speed] - Speed in m/s
 * 
 * @returns {Object} Location update confirmation
 * 
 * @example
 * POST /api/v1/drivers/location
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * Body: { "latitude": 34.05, "longitude": -118.25, "accuracy": 10 }
 */
router.post(
  '/location',
  rateLimiter({
    windowMs: 1000, // 1 second
    max: 5,
    message: 'Too many location updates, please slow down'
  }),
  validate(driverValidation.updateLocation),
  driverController.updateLocation
);

/**
 * @route GET /api/v1/drivers/geofence
 * @description Check if driver is within a geofence
 * @access Driver only
 * 
 * @queryParam {number} latitude - Driver's latitude
 * @queryParam {number} longitude - Driver's longitude
 * @queryParam {string} [zoneId] - Specific zone to check
 * 
 * @returns {Object} Geofence status and zone information
 * 
 * @example
 * GET /api/v1/drivers/geofence?latitude=34.05&longitude=-118.25
 */
router.get(
  '/geofence',
  validate(driverValidation.checkGeofence),
  driverController.checkGeofence
);

// =============================================================================
// STATISTICS & PERFORMANCE
// =============================================================================

/**
 * @route GET /api/v1/drivers/statistics
 * @description Get driver statistics and performance metrics
 * @access Driver only
 * @cache 5 minutes
 * 
 * @queryParam {string} [period=month] - Statistics period
 * 
 * @returns {Object} Statistics including:
 *   - rideStats: { total, completed, cancelled, averageDistance }
 *   - revenueStats: { total, average, peakPeriod }
 *   - ratingStats: { average, total, distribution }
 *   - performance: { acceptanceRate, completionRate, responseTime }
 * 
 * @example
 * GET /api/v1/drivers/statistics?period=week
 */
router.get(
  '/statistics',
  cacheMiddleware({ ttl: 300 }),
  validate(driverValidation.getStatistics),
  driverController.getStatistics
);

// =============================================================================
// FLEET MANAGEMENT
// =============================================================================

/**
 * @route GET /api/v1/drivers/fleet
 * @description Get driver's fleet information (if fleet owner)
 * @access Driver only
 * 
 * @returns {Object} Fleet details and vehicle management
 * 
 * @example
 * GET /api/v1/drivers/fleet
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
router.get(
  '/fleet',
  driverController.getFleetInfo
);

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * @route GET /api/v1/drivers/health
 * @description Health check for driver routes
 * @access Public
 * 
 * @returns {Object} Health status
 * 
 * @example
 * GET /api/v1/drivers/health
 * Response: { status: 'healthy', endpoint: '/api/v1/drivers', version: '2.0.0' }
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    endpoint: '/api/v1/drivers',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      driverManagement: 'operational',
      rideManagement: 'operational'
    }
  });
});

module.exports = router;