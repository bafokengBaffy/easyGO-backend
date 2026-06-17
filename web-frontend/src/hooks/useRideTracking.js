// src/hooks/useRideTracking.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { rideService } from '@/services/ride.service';
import { driverService } from '@/services/driver.service';
import { calculateETA, calculateDistance } from '@/utils/mapUtils';
import toast from 'react-hot-toast';

export const useRideTracking = (rideId, userRole = 'rider') => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocket();

  const fetchRideDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rideService.getRideDetails(rideId);
      setRide(data);
      
      if (data.driver?.location) {
        setDriverLocation(data.driver.location);
        updateEtaAndDistance(data.driver.location, data);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  const updateEtaAndDistance = (driverLoc, rideData) => {
    if (!rideData?.destination) return;
    
    const dist = calculateDistance(
      driverLoc.lat, driverLoc.lng,
      rideData.destination.lat, rideData.destination.lng
    );
    setDistance(dist);
    
    const estimatedTime = calculateETA(dist, 'driving');
    setEta(estimatedTime);
  };

  const updateDriverLocation = useCallback((location) => {
    setDriverLocation(location);
    if (ride) {
      updateEtaAndDistance(location, ride);
    }
  }, [ride]);

  const updateRideStatus = useCallback((status, data = {}) => {
    setRide(prev => ({ ...prev, status, ...data }));
    
    const statusMessages = {
      driver_assigned: `Driver ${data.driver?.name || ''} has been assigned`,
      driver_arrived: 'Your driver has arrived',
      in_progress: 'Ride has started',
      completed: 'Ride completed successfully',
      cancelled: 'Ride has been cancelled'
    };
    
    if (statusMessages[status]) {
      toast[status === 'cancelled' ? 'error' : 'success'](statusMessages[status]);
    }
  }, []);

  const updateDriverETA = useCallback((newEta) => {
    setEta(newEta);
  }, []);

  const updateRoute = useCallback((newRoute) => {
    setRoute(newRoute);
  }, []);

  const shareLocation = useCallback(async (location) => {
    if (userRole === 'driver') {
      await driverService.updateLocation(location);
      socket.emit('driver_location_update', { rideId, location });
    }
  }, [rideId, userRole, socket]);

  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  useEffect(() => {
    if (!socket || !rideId) return;

    // Socket event handlers
    const onDriverLocation = (data) => {
      updateDriverLocation(data.location);
    };

    const onRideStatusUpdate = (data) => {
      updateRideStatus(data.status, data);
    };

    const onETAUpdate = (data) => {
      updateDriverETA(data.eta);
    };

    const onRouteUpdate = (data) => {
      updateRoute(data.route);
    };

    const onDriverMessage = (data) => {
      toast.info(data.message, { duration: 5000 });
    };

    // Register event listeners
    socket.on('driver_location_update', onDriverLocation);
    socket.on('ride_status_update', onRideStatusUpdate);
    socket.on('eta_update', onETAUpdate);
    socket.on('route_update', onRouteUpdate);
    socket.on('driver_message', onDriverMessage);

    // Subscribe to ride updates
    socket.emit('subscribe_ride', { rideId });

    return () => {
      socket.off('driver_location_update', onDriverLocation);
      socket.off('ride_status_update', onRideStatusUpdate);
      socket.off('eta_update', onETAUpdate);
      socket.off('route_update', onRouteUpdate);
      socket.off('driver_message', onDriverMessage);
      socket.emit('unsubscribe_ride', { rideId });
    };
  }, [socket, rideId, updateDriverLocation, updateRideStatus, updateDriverETA, updateRoute]);

  const cancelRide = useCallback(async (reason) => {
    try {
      const result = await rideService.cancelRide(rideId, reason);
      setRide(prev => ({ ...prev, status: 'cancelled' }));
      toast.success('Ride cancelled successfully');
      return result;
    } catch (err) {
      toast.error('Failed to cancel ride');
      throw err;
    }
  }, [rideId]);

  const rateRide = useCallback(async (rating, feedback) => {
    try {
      const result = await rideService.rateRide(rideId, rating, feedback);
      setRide(prev => ({ ...prev, rated: true, rating }));
      toast.success('Thank you for your feedback');
      return result;
    } catch (err) {
      toast.error('Failed to submit rating');
      throw err;
    }
  }, [rideId]);

  return {
    ride,
    loading,
    error,
    driverLocation,
    eta,
    distance,
    route,
    isConnected,
    cancelRide,
    rateRide,
    shareLocation,
    refreshRide: fetchRideDetails
  };
};