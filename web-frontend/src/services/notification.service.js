// src/services/notification.service.js
import { apiClient } from './api/client';
import { socketService } from './socket.service';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = new Map();
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    socketService.on('new_notification', (notification) => {
      this.addNotification(notification);
      this.notifyListeners('new', notification);
    });

    socketService.on('notification_read', ({ notificationId }) => {
      this.markAsRead(notificationId);
      this.notifyListeners('read', { notificationId });
    });
  }

  async fetchNotifications(page = 1, limit = 20) {
    try {
      const response = await apiClient.get('/notifications', { params: { page, limit } });
      this.notifications = response.data.notifications;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  async markAllAsRead() {
    try {
      await apiClient.put('/notifications/read-all');
      this.notifications.forEach(n => n.read = true);
      this.notifyListeners('all_read', null);
      return true;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId) {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.notifyListeners('delete', { notificationId });
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  addNotification(notification) {
    this.notifications.unshift(notification);
    this.showBrowserNotification(notification);
  }

  showBrowserNotification(notification) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/logo-192.png',
        tag: notification.id,
        requireInteraction: notification.requireInteraction || false
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

export const notificationService = new NotificationService();