// src/services/ride.service.js
import { apiClient } from './api/client';
import { socketService } from './socket.service';

class RideService {
  async requestRide(rideData) {
    try {
      const response = await apiClient.post('/rides/request', rideData);
      const ride = response.data;
      
      // Subscribe to ride updates via WebSocket
      socketService.subscribeToRide(ride.id);
      
      return ride;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async getNearbyDrivers(lat, lng, radius = 3) {
    try {
      const response = await apiClient.get('/rides/nearby-drivers', {
        params: { lat, lng, radius }
      });
      return response.data.drivers;
    } catch (error) {
      console.error('Failed to fetch nearby drivers:', error);
      return [];
    }
  }

  async calculateFare(pickup, destination, vehicleType = 'standard') {
    try {
      const response = await apiClient.post('/rides/calculate-fare', {
        pickup,
        destination,
        vehicleType
      });
      return response.data;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async getRideStatus(rideId) {
    try {
      const response = await apiClient.get(`/rides/${rideId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async cancelRide(rideId, reason) {
    try {
      const response = await apiClient.post(`/rides/${rideId}/cancel`, { reason });
      socketService.unsubscribeFromRide(rideId);
      return response.data;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async rateRide(rideId, rating, feedback) {
    try {
      const response = await apiClient.post(`/rides/${rideId}/rate`, {
        rating,
        feedback
      });
      return response.data;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async getRideHistory(filters = {}) {
    try {
      const response = await apiClient.get('/rides/history', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async getActiveRide() {
    try {
      const response = await apiClient.get('/rides/active');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw this.handleRideError(error);
    }
  }

  async getRideDetails(rideId) {
    try {
      const response = await apiClient.get(`/rides/${rideId}`);
      return response.data;
    } catch (error) {
      throw this.handleRideError(error);
    }
  }

  async shareRideLocation(rideId, lat, lng) {
    try {
      await apiClient.post(`/rides/${rideId}/location`, { lat, lng });
    } catch (error) {
      console.error('Failed to share location:', error);
    }
  }

  handleRideError(error) {
    const errorMap = {
      'no_drivers_available': 'No drivers available in your area. Please try again later',
      'invalid_location': 'Please select a valid pickup location',
      'ride_in_progress': 'You already have an active ride',
      'payment_method_required': 'Please add a payment method before requesting a ride',
      'fare_calculation_failed': 'Unable to calculate fare. Please try again',
    };
    
    const errorCode = error.response?.data?.code;
    const message = errorMap[errorCode] || error.response?.data?.message || 'Failed to process ride request';
    
    return new Error(message);
  }
}

export const rideService = new RideService();