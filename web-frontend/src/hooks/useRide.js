// src/hooks/useRide.js
import { useState, useEffect, useCallback } from 'react';
import { rideService } from '@/services/ride.service';
import { socketService } from '@/services/socket.service';
import toast from 'react-hot-toast';

export const useRide = (rideId = null) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [fareEstimate, setFareEstimate] = useState(null);

  const requestRide = async (rideData) => {
    setLoading(true);
    setError(null);
    try {
      const newRide = await rideService.requestRide(rideData);
      setRide(newRide);
      toast.success('Ride requested successfully');
      return newRide;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (reason) => {
    if (!ride) return;
    
    setLoading(true);
    try {
      const cancelledRide = await rideService.cancelRide(ride.id, reason);
      setRide(cancelledRide);
      toast.success('Ride cancelled successfully');
      return cancelledRide;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rateRide = async (rating, feedback) => {
    if (!ride) return;
    
    setLoading(true);
    try {
      const ratedRide = await rideService.rateRide(ride.id, rating, feedback);
      setRide(ratedRide);
      toast.success('Thank you for your feedback');
      return ratedRide;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNearbyDrivers = useCallback(async (lat, lng) => {
    try {
      const drivers = await rideService.getNearbyDrivers(lat, lng);
      setNearbyDrivers(drivers);
      return drivers;
    } catch (err) {
      console.error('Failed to fetch nearby drivers:', err);
      return [];
    }
  }, []);

  const calculateFare = useCallback(async (pickup, destination, vehicleType) => {
    try {
      const estimate = await rideService.calculateFare(pickup, destination, vehicleType);
      setFareEstimate(estimate);
      return estimate;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getActiveRide = useCallback(async () => {
    setLoading(true);
    try {
      const activeRide = await rideService.getActiveRide();
      setRide(activeRide);
      if (activeRide) {
        socketService.subscribeToRide(activeRide.id);
      }
      return activeRide;
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (rideId) {
      const fetchRide = async () => {
        setLoading(true);
        try {
          const rideDetails = await rideService.getRideDetails(rideId);
          setRide(rideDetails);
          socketService.subscribeToRide(rideId);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRide();
    } else {
      getActiveRide();
    }

    return () => {
      if (ride?.id) {
        socketService.unsubscribeFromRide(ride.id);
      }
    };
  }, [rideId, getActiveRide]);

  // WebSocket event listeners
  useEffect(() => {
    if (!ride?.id) return;

    const handleDriverAssigned = (data) => {
      setRide(prev => ({ ...prev, driver: data.driver, status: 'driver_assigned' }));
      toast.success(`Driver ${data.driver.name} assigned to your ride`);
    };

    const handleDriverArrived = () => {
      setRide(prev => ({ ...prev, status: 'driver_arrived' }));
      toast.info('Your driver has arrived');
    };

    const handleRideStarted = () => {
      setRide(prev => ({ ...prev, status: 'in_progress' }));
      toast.success('Ride started! Enjoy your trip');
    };

    const handleRideCompleted = (data) => {
      setRide(prev => ({ ...prev, status: 'completed', fare: data.fare }));
      toast.success('Ride completed successfully');
    };

    const handleLocationUpdated = (data) => {
      setRide(prev => ({
        ...prev,
        driverLocation: data.location,
        eta: data.eta
      }));
    };

    socketService.on('driver_assigned', handleDriverAssigned);
    socketService.on('driver_arrived', handleDriverArrived);
    socketService.on('ride_started', handleRideStarted);
    socketService.on('ride_completed', handleRideCompleted);
    socketService.on('driver_location_updated', handleLocationUpdated);

    return () => {
      socketService.off('driver_assigned', handleDriverAssigned);
      socketService.off('driver_arrived', handleDriverArrived);
      socketService.off('ride_started', handleRideStarted);
      socketService.off('ride_completed', handleRideCompleted);
      socketService.off('driver_location_updated', handleLocationUpdated);
    };
  }, [ride?.id]);

  return {
    ride,
    loading,
    error,
    nearbyDrivers,
    fareEstimate,
    requestRide,
    cancelRide,
    rateRide,
    getNearbyDrivers,
    calculateFare,
    getActiveRide,
  };
};