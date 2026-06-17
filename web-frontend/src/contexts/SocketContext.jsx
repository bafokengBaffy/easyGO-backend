// src/contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '@/services/socket.service';
import { useAuthContext } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const handleNewNotification = (notification) => {
      setLastMessage(notification);
      toast(notification.message, {
        icon: notification.icon || '🔔',
        duration: 5000,
      });
    };

    const handleRideUpdate = (update) => {
      setLastMessage(update);
      if (update.status === 'driver_assigned') {
        toast.success(`Driver ${update.driverName} is on the way!`);
      } else if (update.status === 'driver_arrived') {
        toast.info('Your driver has arrived');
      } else if (update.status === 'ride_started') {
        toast.success('Ride started! Enjoy your trip');
      } else if (update.status === 'ride_completed') {
        toast.success('Ride completed successfully');
      }
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('notification', handleNewNotification);
    socketService.on('ride_update', handleRideUpdate);

    if (socketService.isConnected()) {
      setIsConnected(true);
    }

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('notification', handleNewNotification);
      socketService.off('ride_update', handleRideUpdate);
    };
  }, [isAuthenticated]);

  const emit = (event, data) => {
    socketService.emit(event, data);
  };

  const subscribe = (channel) => {
    socketService.emit('subscribe', { channel });
  };

  const unsubscribe = (channel) => {
    socketService.emit('unsubscribe', { channel });
  };

  const value = {
    isConnected,
    lastMessage,
    emit,
    subscribe,
    unsubscribe,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};