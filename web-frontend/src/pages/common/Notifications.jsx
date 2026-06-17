// src/pages/common/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCircle, AlertCircle, Info, XCircle,
  Trash2, CheckCheck, Calendar, Car, DollarSign, Gift
} from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import Button from '@/components/common/Button';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time listener
    notificationService.on('new', handleNewNotification);
    notificationService.on('read', handleNotificationRead);
    notificationService.on('delete', handleNotificationDeleted);
    
    return () => {
      notificationService.off('new', handleNewNotification);
      notificationService.off('read', handleNotificationRead);
      notificationService.off('delete', handleNotificationDeleted);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.fetchNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    toast.info(notification.message);
  };

  const handleNotificationRead = ({ notificationId }) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleNotificationDeleted = ({ notificationId }) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (notificationId) => {
    await notificationService.deleteNotification(notificationId);
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ride: <Car className="w-5 h-5" />,
      payment: <DollarSign className="w-5 h-5" />,
      promotion: <Gift className="w-5 h-5" />,
      reminder: <Calendar className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      warning: <AlertCircle className="w-5 h-5" />,
      error: <XCircle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />
    };
    return icons[type] || <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      ride: 'bg-blue-100 text-blue-600',
      payment: 'bg-green-100 text-green-600',
      promotion: 'bg-purple-100 text-purple-600',
      reminder: 'bg-yellow-100 text-yellow-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
      info: 'bg-blue-100 text-blue-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} icon={CheckCheck} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-2 inline-flex">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">Loading...</div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          {notification.actionLink && (
                            <a
                              href={notification.actionLink}
                              className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                            >
                              {notification.actionText || 'View Details'} →
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You don't have any notifications yet" 
                  : `No ${filter} notifications`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;