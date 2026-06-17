// src/components/ride/RideTracking.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, MessageCircle, AlertTriangle, Star } from 'lucide-react';
import { useRide } from '@/hooks/useRide';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/common/Button';
import { formatCurrency, formatDistance, formatDuration } from '@/utils/formatters';
import toast from 'react-hot-toast';

const RideTracking = ({ rideId, userRole }) => {
  const { ride, loading, cancelRide, rateRide } = useRide(rideId);
  const { emit, isConnected } = useSocket();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (ride?.status === 'in_progress') {
      // Start tracking location updates
      const interval = setInterval(() => {
        if (ride.driver?.location) {
          updateMapLocation(ride.driver.location);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [ride?.status, ride?.driver?.location]);

  const updateMapLocation = (location) => {
    // Update map view with driver's current location
    if (window.mapInstance) {
      window.mapInstance.setView([location.lat, location.lng], 15);
      if (window.driverMarker) {
        window.driverMarker.setLatLng([location.lat, location.lng]);
      }
    }
  };

  const handleCancelRide = async () => {
    if (!cancelReason) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    try {
      await cancelRide(cancelReason);
      setShowCancelModal(false);
      toast.success('Ride cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel ride');
    }
  };

  const handleRateRide = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      await rateRide(rating, feedback);
      setShowRatingModal(false);
      toast.success('Thank you for your feedback');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'searching': 'Searching for a driver...',
      'driver_assigned': 'Driver assigned',
      'driver_arrived': 'Driver has arrived',
      'in_progress': 'Ride in progress',
      'completed': 'Ride completed',
      'cancelled': 'Ride cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'searching': 'text-yellow-600',
      'driver_assigned': 'text-blue-600',
      'driver_arrived': 'text-green-600',
      'in_progress': 'text-purple-600',
      'completed': 'text-gray-600',
      'cancelled': 'text-red-600',
    };
    return colorMap[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">Ride not found</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div id="ride-map" className="h-96 bg-gray-200">
                {/* Map will be rendered here */}
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Ride Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)} bg-opacity-10`}>
                  {getStatusText(ride.status)}
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Progress Steps */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  {['searching', 'driver_assigned', 'driver_arrived', 'in_progress', 'completed'].map((step, index) => {
                    const stepIndex = ['searching', 'driver_assigned', 'driver_arrived', 'in_progress', 'completed'].indexOf(ride.status);
                    const isCompleted = index <= stepIndex;
                    const isCurrent = index === stepIndex;
                    
                    return (
                      <div key={step} className="relative flex items-start mb-6 last:mb-0">
                        <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                          {isCompleted && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="ml-4">
                          <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {getStatusText(step)}
                          </p>
                          {step === 'driver_assigned' && ride.driver && (
                            <p className="text-sm text-gray-500 mt-1">
                              Driver: {ride.driver.name} • {ride.driver.rating}★
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Driver Info Card */}
            {ride.driver && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Driver Information</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{ride.driver.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {ride.driver.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-lg">{ride.driver.name}</p>
                    <p className="text-sm text-gray-500">{ride.driver.vehicle.model}</p>
                    <p className="text-sm text-gray-500">License: {ride.driver.licensePlate}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" icon={Phone} fullWidth>
                    Call
                  </Button>
                  <Button variant="outline" icon={MessageCircle} fullWidth>
                    Message
                  </Button>
                </div>
              </div>
            )}

            {/* Trip Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Trip Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup</p>
                    <p className="font-medium">{ride.pickup.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Navigation className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium">{ride.destination.address}</p>
                  </div>
                </div>
                
                {ride.eta && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-gray-600">Estimated Arrival</span>
                    <span className="font-medium">{ride.eta}</span>
                  </div>
                )}
                
                {ride.fare && ride.status === 'completed' && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-gray-600">Total Fare</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(ride.fare)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {ride.status === 'searching' && (
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
                fullWidth
              >
                Cancel Ride
              </Button>
            )}
            
            {ride.status === 'completed' && !ride.rated && (
              <Button
                onClick={() => setShowRatingModal(true)}
                fullWidth
              >
                Rate Your Ride
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Ride Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Ride"
        size="md"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Reason for cancellation</span>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a reason</option>
              <option value="driver_too_far">Driver is too far away</option>
              <option value="changed_plans">Changed plans</option>
              <option value="long_wait_time">Long wait time</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)} fullWidth>
              Keep Ride
            </Button>
            <Button variant="danger" onClick={handleCancelRide} fullWidth>
              Cancel Ride
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Ride"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience (optional)"
            rows="4"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRatingModal(false)} fullWidth>
              Skip
            </Button>
            <Button onClick={handleRateRide} fullWidth>
              Submit Rating
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RideTracking;