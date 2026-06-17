// src/pages/driver/CurrentTrip.jsx
import React, { useState, useEffect } from 'react';
import { Navigation, Phone, MessageCircle, MapPin, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRideTracking } from '@/hooks/useRideTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { formatCurrency, formatDistance, formatDuration } from '@/utils/formatters';
import toast from 'react-hot-toast';

const CurrentTrip = ({ rideId }) => {
  const { 
    ride, 
    loading, 
    driverLocation, 
    eta, 
    distance,
    shareLocation,
    startRide,
    completeRide
  } = useRideTracking(rideId, 'driver');
  
  const { location, startWatching, stopWatching } = useGeolocation();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [finalFare, setFinalFare] = useState(null);
  const [tripStarted, setTripStarted] = useState(false);

  useEffect(() => {
    if (ride?.status === 'in_progress') {
      setTripStarted(true);
      startWatching();
    }
    
    return () => {
      stopWatching();
    };
  }, [ride?.status]);

  useEffect(() => {
    if (location && tripStarted) {
      shareLocation(location);
    }
  }, [location, tripStarted]);

  const handleStartTrip = async () => {
    try {
      await startRide();
      setTripStarted(true);
      toast.success('Trip started! Navigating to destination');
    } catch (error) {
      toast.error('Failed to start trip');
    }
  };

  const handleCompleteTrip = async () => {
    const fare = finalFare || ride?.estimatedFare;
    try {
      await completeRide(fare);
      toast.success('Trip completed successfully');
      setShowCompleteModal(false);
      setTimeout(() => {
        window.location.href = '/driver';
      }, 2000);
    } catch (error) {
      toast.error('Failed to complete trip');
    }
  };

  const getStatusStep = () => {
    const steps = [
      { key: 'driver_assigned', label: 'Driver Assigned', icon: CheckCircle },
      { key: 'driver_arrived', label: 'Arrived at Pickup', icon: MapPin },
      { key: 'in_progress', label: 'Trip in Progress', icon: Navigation },
      { key: 'completed', label: 'Trip Completed', icon: CheckCircle }
    ];
    
    let currentIndex = steps.findIndex(step => step.key === ride?.status);
    if (currentIndex === -1) currentIndex = 0;
    
    return steps.map((step, index) => {
      const StepIcon = step.icon;
      const isCompleted = index <= currentIndex;
      const isCurrent = index === currentIndex;
      
      return (
        <div key={step.key} className="flex-1 relative">
          <div className="flex flex-col items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
              ${isCurrent ? 'ring-4 ring-green-200' : ''}
            `}>
              <StepIcon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs mt-2 text-center font-medium">{step.label}</p>
            {index < steps.length - 1 && (
              <div className={`
                absolute top-5 left-1/2 w-full h-0.5
                ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
              `} style={{ transform: 'translateX(10px)' }} />
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">No Active Trip</h2>
        <p className="text-gray-500 mt-2">You don't have any active trips at the moment</p>
        <Button onClick={() => window.location.href = '/driver'} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Trip Progress</h2>
            <span className="text-sm text-gray-500">Trip #{ride.id}</span>
          </div>
          <div className="flex justify-between relative">
            {getStatusStep()}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trip Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Trip Details</h2>
              
              {/* Pickup */}
              <div className="mb-6">
                <div className="flex items-start mb-4">
                  <div className="flex flex-col items-center mr-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-12 bg-gray-300"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Pickup Location</p>
                      <p className="font-medium">{ride.pickup.address}</p>
                      {ride.pickup.instructions && (
                        <p className="text-sm text-gray-400 mt-1">
                          Instructions: {ride.pickup.instructions}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{ride.destination.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rider Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Rider Information</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {ride.rider.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{ride.rider.name}</p>
                      <p className="text-sm text-gray-500">⭐ {ride.rider.rating} rating</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" icon={Phone}>
                      Call
                    </Button>
                    <Button size="sm" variant="outline" icon={MessageCircle}>
                      Message
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trip Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">ETA</p>
                  <p className="font-bold">{eta || 'Calculating...'}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Navigation className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-bold">{distance ? formatDistance(distance * 1000) : '--'}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Fare</p>
                  <p className="font-bold">{formatCurrency(ride.estimatedFare)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Current Location Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-3">Your Current Location</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Lat: {location?.lat?.toFixed(6)}</span>
                <span className="mx-2">•</span>
                <span>Lng: {location?.lng?.toFixed(6)}</span>
              </div>
              <p className="text-xs text-gray-400">Live location sharing is active</p>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Trip Actions</h3>
              <div className="space-y-3">
                {ride.status === 'driver_assigned' && (
                  <Button 
                    onClick={() => {
                      // Update status to arrived
                      toast.success('Marked as arrived at pickup');
                    }} 
                    fullWidth
                  >
                    I've Arrived at Pickup
                  </Button>
                )}
                
                {ride.status === 'driver_arrived' && (
                  <Button onClick={handleStartTrip} fullWidth>
                    Start Trip
                  </Button>
                )}
                
                {ride.status === 'in_progress' && (
                  <Button 
                    onClick={() => setShowCompleteModal(true)} 
                    fullWidth
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Trip
                  </Button>
                )}
                
                {(ride.status === 'driver_assigned' || ride.status === 'driver_arrived') && (
                  <Button 
                    variant="danger" 
                    onClick={() => setShowCancelModal(true)} 
                    fullWidth
                  >
                    Cancel Trip
                  </Button>
                )}
              </div>
            </div>

            {/* Fare Adjustment (for completed trips) */}
            {ride.status === 'in_progress' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-3">Adjust Fare (Optional)</h3>
                <input
                  type="number"
                  placeholder="Enter final fare"
                  value={finalFare}
                  onChange={(e) => setFinalFare(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use estimated fare. Additional charges may apply for waiting time or route changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Trip"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to complete this trip? The rider will be charged the final fare.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Estimated Fare</span>
              <span>{formatCurrency(ride.estimatedFare)}</span>
            </div>
            {finalFare && finalFare !== ride.estimatedFare && (
              <div className="flex justify-between font-bold">
                <span>Final Fare</span>
                <span className="text-green-600">{formatCurrency(finalFare)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCompleteModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleCompleteTrip} fullWidth>
              Complete Trip
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Trip Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Trip"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this trip? This may affect your acceptance rate.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation"
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)} fullWidth>
              Go Back
            </Button>
            <Button variant="danger" onClick={handleCancelTrip} fullWidth>
              Cancel Trip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CurrentTrip;