const Joi = require('joi');

const bookRide = {
    body: Joi.object().keys({
        pickup_location: Joi.object().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).required(),
        dropoff_location: Joi.object().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).required(),
        ride_type: Joi.string().valid('standard', 'premium', 'van').default('standard'),
        promotion_code: Joi.string().alphanum().optional()
    }),
};

const instantBook = {
    body: Joi.object().keys({
        pickup_location: Joi.object().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).required(),
        dropoff_location: Joi.object().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).required(),
        ride_type: Joi.string().valid('standard', 'premium', 'van').default('standard'),
        promotion_code: Joi.string().alphanum().optional()
    }),
};

const updateRideStatus = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('accepted', 'arrived', 'picked_up', 'completed', 'cancelled').required(),
        location: Joi.object().keys({
            lat: Joi.number().required(),
            lng: Joi.number().required()
        }).optional()
    })
};

const getEstimate = {
    body: Joi.object().keys({
        pickup: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).required(),
        dropoff: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).required(),
        vehicleType: Joi.string().optional(),
        seats: Joi.number().integer().min(1).optional()
    })
};

const getPaymentDetails = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const processPayment = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        paymentMethod: Joi.string().valid('wallet', 'stripe', 'cash', 'mpesa', 'ecocash').required(),
        amount: Joi.number().positive().required(),
        tip: Joi.number().min(0).optional()
    })
};

const cancelRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        reason: Joi.string().required(),
        cancelledBy: Joi.string().valid('rider', 'driver', 'admin').default('rider')
    })
};

const getRideById = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const getRideHistory = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        status: Joi.string().optional(),
        startDate: Joi.string().isoDate().optional(),
        endDate: Joi.string().isoDate().optional(),
        type: Joi.string().valid('past', 'upcoming').optional()
    })
};

const acceptRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        driverLocation: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).optional()
    }).optional()
};

const arriveRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        location: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).optional()
    }).optional()
};

const startRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        startLocation: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).optional()
    }).optional()
};

const completeRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        endLocation: Joi.object().keys({
            latitude: Joi.number().optional(),
            longitude: Joi.number().optional()
        }).optional(),
        distance: Joi.number().positive().optional(),
        duration: Joi.number().positive().optional(),
        paymentMethod: Joi.string().valid('card', 'wallet', 'cash', 'mpesa', 'ecocash').optional()
    }).optional()
};

const getTrackingInfo = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const getRouteDetails = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const rateRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        rating: Joi.number().integer().min(1).max(5).required(),
        review: Joi.string().optional(),
        target: Joi.string().valid('driver', 'rider').default('driver')
    })
};

const getRideReviews = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

const createRecurringRide = {
    body: Joi.object().keys({
        rideDetails: Joi.object().required(),
        frequency: Joi.string().valid('daily', 'weekly', 'monthly').required(),
        startDate: Joi.string().isoDate().required(),
        endDate: Joi.string().isoDate().optional(),
        daysOfWeek: Joi.array().items(Joi.string()).optional(),
        daysOfMonth: Joi.array().items(Joi.number().integer().min(1).max(31)).optional()
    })
};

const getRecurringRides = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

const updateRecurringRide = {
    params: Joi.object().keys({
        scheduleId: Joi.string().required()
    }),
    body: Joi.object().keys({
        rideDetails: Joi.object().optional(),
        frequency: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
        startDate: Joi.string().isoDate().optional(),
        endDate: Joi.string().isoDate().optional(),
        daysOfWeek: Joi.array().items(Joi.string()).optional(),
        daysOfMonth: Joi.array().items(Joi.number().integer().min(1).max(31)).optional()
    }).optional()
};

const cancelRecurringRide = {
    params: Joi.object().keys({
        scheduleId: Joi.string().required()
    })
};

const getAvailablePromotions = {
    query: Joi.object().keys({
        pickupLat: Joi.number().required(),
        pickupLng: Joi.number().required(),
        dropoffLat: Joi.number().required(),
        dropoffLng: Joi.number().required(),
        estimatedFare: Joi.number().positive().optional()
    })
};

const applyPromotion = {
    body: Joi.object().keys({
        rideId: Joi.string().required(),
        code: Joi.string().required()
    })
};

const getRideStatistics = {
    query: Joi.object().keys({
        period: Joi.string().valid('day', 'week', 'month').default('month'),
        startDate: Joi.string().isoDate().optional(),
        endDate: Joi.string().isoDate().optional()
    })
};

module.exports = {
    bookRide,
    instantBook,
    updateRideStatus,
    getEstimate,
    getRideById,
    getRideHistory,
    cancelRide,
    acceptRide,
    arriveRide,
    startRide,
    completeRide,
    getTrackingInfo,
    getRouteDetails,
    getPaymentDetails,
    processPayment,
    rateRide,
    getRideReviews,
    createRecurringRide,
    getRecurringRides,
    updateRecurringRide,
    cancelRecurringRide,
    getAvailablePromotions,
    applyPromotion,
    getRideStatistics
};
