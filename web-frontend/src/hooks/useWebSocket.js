// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '@/services/socket.service';
import toast from 'react-hot-toast';

export const useWebSocket = (events = {}) => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [lastMessage, setLastMessage] = useState(null);
  const eventHandlers = useRef(events);

  useEffect(() => {
    eventHandlers.current = events;
  }, [events]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    const handleReconnect = () => {
      toast.info('Reconnecting...');
    };

    const handleReconnectSuccess = () => {
      setIsConnected(true);
      toast.success('Reconnected successfully');
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error');
    };

    // Generic message handler
    const handleMessage = (event, data) => {
      setLastMessage({ event, data });
      
      if (eventHandlers.current[event]) {
        eventHandlers.current[event](data);
      }
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('reconnect', handleReconnect);
    socketService.on('reconnect_success', handleReconnectSuccess);
    socketService.on('error', handleError);

    // Register dynamic event handlers
    Object.keys(events).forEach(event => {
      socketService.on(event, (data) => handleMessage(event, data));
    });

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('reconnect', handleReconnect);
      socketService.off('reconnect_success', handleReconnectSuccess);
      socketService.off('error', handleError);

      Object.keys(events).forEach(event => {
        socketService.off(event);
      });
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (isConnected) {
      socketService.emit(event, data);
    } else {
      console.warn('WebSocket not connected');
    }
  }, [isConnected]);

  const subscribe = useCallback((channel) => {
    socketService.subscribe(channel);
  }, []);

  const unsubscribe = useCallback((channel) => {
    socketService.unsubscribe(channel);
  }, []);

  return {
    isConnected,
    lastMessage,
    emit,
    subscribe,
    unsubscribe,
  };
};