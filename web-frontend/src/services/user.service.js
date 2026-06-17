// src/services/user.service.js
import { apiClient } from './api/client';

export const userService = {
  // Profile Management
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete('/user/avatar');
    return response.data;
  },

  // Preferences
  getPreferences: async () => {
    const response = await apiClient.get('/user/preferences');
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await apiClient.put('/user/preferences', preferences);
    return response.data;
  },

  // Saved Places
  getSavedPlaces: async () => {
    const response = await apiClient.get('/user/saved-places');
    return response.data;
  },

  addSavedPlace: async (placeData) => {
    const response = await apiClient.post('/user/saved-places', placeData);
    return response.data;
  },

  updateSavedPlace: async (placeId, placeData) => {
    const response = await apiClient.put(`/user/saved-places/${placeId}`, placeData);
    return response.data;
  },

  deleteSavedPlace: async (placeId) => {
    const response = await apiClient.delete(`/user/saved-places/${placeId}`);
    return response.data;
  },

  // Payment Methods (Rider specific)
  getPaymentMethods: async () => {
    const response = await apiClient.get('/user/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (paymentData) => {
    const response = await apiClient.post('/user/payment-methods', paymentData);
    return response.data;
  },

  deletePaymentMethod: async (methodId) => {
    const response = await apiClient.delete(`/user/payment-methods/${methodId}`);
    return response.data;
  },

  setDefaultPaymentMethod: async (methodId) => {
    const response = await apiClient.put(`/user/payment-methods/${methodId}/default`);
    return response.data;
  },

  // Ride History
  getRideHistory: async (filters = {}) => {
    const response = await apiClient.get('/user/rides', { params: filters });
    return response.data;
  },

  getRideDetails: async (rideId) => {
    const response = await apiClient.get(`/user/rides/${rideId}`);
    return response.data;
  },

  // Statistics
  getRiderStats: async () => {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },

  // Notifications
  getNotifications: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/user/notifications', { params: { page, limit } });
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await apiClient.put(`/user/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.put('/user/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/user/notifications/${notificationId}`);
    return response.data;
  },

  // Referrals
  getReferralInfo: async () => {
    const response = await apiClient.get('/user/referrals');
    return response.data;
  },

  getReferralStats: async () => {
    const response = await apiClient.get('/user/referrals/stats');
    return response.data;
  },

  createReferralCode: async () => {
    const response = await apiClient.post('/user/referrals/code');
    return response.data;
  },

  // Support
  createSupportTicket: async (ticketData) => {
    const response = await apiClient.post('/user/support', ticketData);
    return response.data;
  },

  getSupportTickets: async () => {
    const response = await apiClient.get('/user/support');
    return response.data;
  },

  getSupportTicket: async (ticketId) => {
    const response = await apiClient.get(`/user/support/${ticketId}`);
    return response.data;
  },

  addTicketMessage: async (ticketId, message, attachments = []) => {
    const formData = new FormData();
    formData.append('message', message);
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
    const response = await apiClient.post(`/user/support/${ticketId}/messages`, formData);
    return response.data;
  },

  closeTicket: async (ticketId) => {
    const response = await apiClient.put(`/user/support/${ticketId}/close`);
    return response.data;
  }
};