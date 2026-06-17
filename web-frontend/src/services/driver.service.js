// src/services/driver.service.js
import { apiClient } from './api/client';
import { socketService } from './socket.service';

export const driverService = {
  // Driver Profile Management
  getProfile: async () => {
    const response = await apiClient.get('/driver/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/driver/profile', profileData);
    return response.data;
  },

  updateVehicle: async (vehicleData) => {
    const response = await apiClient.put('/driver/vehicle', vehicleData);
    return response.data;
  },

  uploadDocuments: async (documents) => {
    const formData = new FormData();
    Object.keys(documents).forEach(key => {
      formData.append(key, documents[key]);
    });
    const response = await apiClient.post('/driver/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Status Management
  updateStatus: async (isOnline, location = null) => {
    const response = await apiClient.post('/driver/status', { isOnline, location });
    
    if (isOnline && location) {
      socketService.emit('driver_online', { driverId: response.data.id, location });
    } else {
      socketService.emit('driver_offline', { driverId: response.data.id });
    }
    
    return response.data;
  },

  updateLocation: async (location) => {
    const response = await apiClient.post('/driver/location', location);
    socketService.emit('driver_location_update', { driverId: response.data.id, location });
    return response.data;
  },

  // Ride Management
  getAvailableRides: async (location, radius = 5) => {
    const response = await apiClient.get('/driver/rides/available', {
      params: { lat: location.lat, lng: location.lng, radius }
    });
    return response.data;
  },

  acceptRide: async (rideId) => {
    const response = await apiClient.post(`/driver/rides/${rideId}/accept`);
    socketService.emit('ride_accepted', { rideId, driverId: response.data.driverId });
    return response.data;
  },

  rejectRide: async (rideId, reason = null) => {
    const response = await apiClient.post(`/driver/rides/${rideId}/reject`, { reason });
    return response.data;
  },

  startRide: async (rideId) => {
    const response = await apiClient.post(`/driver/rides/${rideId}/start`);
    socketService.emit('ride_started', { rideId });
    return response.data;
  },

  completeRide: async (rideId, fare) => {
    const response = await apiClient.post(`/driver/rides/${rideId}/complete`, { fare });
    socketService.emit('ride_completed', { rideId, fare });
    return response.data;
  },

  getCurrentRide: async () => {
    try {
      const response = await apiClient.get('/driver/rides/current');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  getRideHistory: async (filters = {}) => {
    const response = await apiClient.get('/driver/rides/history', { params: filters });
    return response.data;
  },

  // Earnings
  getEarnings: async (period = 'week') => {
    const response = await apiClient.get('/driver/earnings', { params: { period } });
    return response.data;
  },

  getRideTransactions: async (period = 'week') => {
    const response = await apiClient.get('/driver/transactions', { params: { period } });
    return response.data;
  },

  exportEarningsStatement: async (period) => {
    const response = await apiClient.get('/driver/earnings/export', {
      params: { period },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `earnings_${period}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Statistics
  getStats: async () => {
    const response = await apiClient.get('/driver/stats');
    return response.data;
  },

  getPerformanceMetrics: async (period = 'month') => {
    const response = await apiClient.get('/driver/metrics', { params: { period } });
    return response.data;
  },

  // Reviews
  getReviews: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/driver/reviews', { params: { page, limit } });
    return response.data;
  },

  respondToReview: async (reviewId, response) => {
    const result = await apiClient.post(`/driver/reviews/${reviewId}/respond`, { response });
    return result.data;
  }
};