// src/pages/rider/RideBooking.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, DollarSign, Car, User, CreditCard, AlertCircle } from 'lucide-react';
import { useRide } from '@/hooks/useRide';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePayment } from '@/hooks/usePayment';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { formatCurrency, formatDistance, formatDuration } from '@/utils/formatters';
import toast from 'react-hot-toast';

const RideBooking = () => {
  const { location: currentLocation, loading: locationLoading } = useGeolocation();
  const { requestRide, calculateFare, fareEstimate, loading: rideLoading } = useRide();
  const { paymentMethods, loadPaymentMethods, loading: paymentLoading } = usePayment();
  
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [vehicleType, setVehicleType] = useState('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchingDrivers, setSearchingDrivers] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  const vehicleTypes = [
    { id: 'economy', name: 'Economy', icon: Car, baseFare: 5, pricePerKm: 1, capacity: 4, eta: 3 },
    { id: 'standard', name: 'Standard', icon: Car, baseFare: 8, pricePerKm: 1.5, capacity: 4, eta: 2 },
    { id: 'premium', name: 'Premium', icon: Car, baseFare: 15, pricePerKm: 2.5, capacity: 4, eta: 5 },
    { id: 'suv', name: 'SUV', icon: Car, baseFare: 20, pricePerKm: 3, capacity: 6, eta: 7 },
  ];

  useEffect(() => {
    if (currentLocation && !pickup) {
      setPickup({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      });
      reverseGeocode(currentLocation.lat, currentLocation.lng, setPickupAddress);
    }
  }, [currentLocation]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const reverseGeocode = async (lat, lng, setAddress) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleLocationSelect = async (type, location) => {
    if (type === 'pickup') {
      setPickup(location);
      reverseGeocode(location.lat, location.lng, setPickupAddress);
    } else {
      setDestination(location);
      reverseGeocode(location.lat, location.lng, setDestinationAddress);
      
      // Calculate fare when destination is selected
      if (pickup) {
        await calculateFare(pickup, location, vehicleType);
      }
    }
  };

  const handleVehicleTypeChange = async (type) => {
    setVehicleType(type);
    if (pickup && destination) {
      await calculateFare(pickup, destination, type);
    }
  };

  const handleBookRide = async () => {
    if (!pickup || !destination) {
      toast.error('Please select pickup and destination locations');
      return;
    }

    if (!selectedPaymentMethod && paymentMethods.length === 0) {
      setShowPaymentModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmRide = async () => {
    setShowConfirmModal(false);
    setSearchingDrivers(true);

    try {
      const rideData = {
        pickup: {
          lat: pickup.lat,
          lng: pickup.lng,
          address: pickupAddress,
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng,
          address: destinationAddress,
        },
        vehicleType,
        paymentMethodId: selectedPaymentMethod || paymentMethods[0]?.id,
        estimatedFare: fareEstimate?.total,
      };

      const ride = await requestRide(rideData);
      toast.success('Ride booked successfully! Finding a driver for you...');
      
      // Redirect to ride tracking page
      setTimeout(() => {
        window.location.href = `/rider/active-ride/${ride.id}`;
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setSearchingDrivers(false);
    }
  };

  const currentVehicle = vehicleTypes.find(v => v.id === vehicleType);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Location Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Where are you going?</h1>
                
                {/* Pickup Location */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter pickup location"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {locationLoading && (
                    <p className="text-sm text-gray-500 mt-2">Detecting your location...</p>
                  )}
                </div>

                {/* Destination */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                    <input
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Recent Places */}
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Recent Places</h3>
                  <div className="space-y-2">
                    {['Home', 'Work', 'Airport'].map((place, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{place}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Options */}
          <div className="space-y-6">
            {/* Vehicle Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Select Vehicle</h2>
              <div className="space-y-3">
                {vehicleTypes.map((vehicle) => {
                  const Icon = vehicle.icon;
                  const isSelected = vehicleType === vehicle.id;
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleTypeChange(vehicle.id)}
                      className={`
                        w-full p-4 rounded-lg border-2 transition-all text-left
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                          <div className="ml-3">
                            <p className="font-medium">{vehicle.name}</p>
                            <p className="text-sm text-gray-500">Up to {vehicle.capacity} seats</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">From ${vehicle.baseFare}</p>
                          <p className="text-sm text-gray-500">ETA: {vehicle.eta} min</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fare Estimate */}
            {fareEstimate && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Fare Estimate</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">{formatDistance(fareEstimate.distance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{formatDuration(fareEstimate.duration)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="font-medium">{formatCurrency(fareEstimate.baseFare)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance Charge</span>
                    <span className="font-medium">{formatCurrency(fareEstimate.distanceCharge)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Charge</span>
                    <span className="font-medium">{formatCurrency(fareEstimate.timeCharge)}</span>
                  </div>
                  {fareEstimate.surgeMultiplier > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600">Surge Pricing ({fareEstimate.surgeMultiplier}x)</span>
                      <span className="text-orange-600 font-medium">
                        {formatCurrency(fareEstimate.surgeCharge)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-xl text-blue-600">
                        {formatCurrency(fareEstimate.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add New
                </button>
              </div>
              
              {paymentMethods.length > 0 ? (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`
                        w-full p-3 rounded-lg border-2 transition-all text-left flex items-center
                        ${selectedPaymentMethod === method.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                        }
                      `}
                    >
                      <CreditCard className={`w-5 h-5 ${selectedPaymentMethod === method.id ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="ml-3">
                        <p className="font-medium">{method.type}</p>
                        <p className="text-sm text-gray-500">**** {method.last4}</p>
                      </div>
                      {method.isDefault && (
                        <span className="ml-auto text-xs text-green-600">Default</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  + Add Payment Method
                </button>
              )}
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBookRide}
              loading={rideLoading || searchingDrivers}
              disabled={!pickup || !destination || (!selectedPaymentMethod && paymentMethods.length === 0)}
              size="lg"
              fullWidth
              className="bg-blue-600 hover:bg-blue-700"
            >
              {searchingDrivers ? 'Finding Drivers...' : 'Request Ride'}
            </Button>

            {(!pickup || !destination) && (
              <div className="flex items-center text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-2" />
                Please select both pickup and destination
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Payment Method"
        size="md"
      >
        <AddPaymentMethodForm
          onSuccess={(method) => {
            setSelectedPaymentMethod(method.id);
            setShowPaymentModal(false);
            loadPaymentMethods();
          }}
          onCancel={() => setShowPaymentModal(false)}
        />
      </Modal>

      {/* Confirm Ride Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Your Ride"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start mb-3">
              <MapPin className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pickup</p>
                <p className="font-medium">{pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Navigation className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium">{destinationAddress}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Car className="w-5 h-5 text-gray-400 mr-2" />
              <span>{currentVehicle?.name}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <span>ETA: {currentVehicle?.eta} min</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(fareEstimate?.total || 0)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={confirmRide} fullWidth>
              Confirm Ride
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const { addPaymentMethod } = usePayment();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const method = await addPaymentMethod({
        type: 'credit_card',
        cardNumber,
        expiryDate,
        cvv,
        cardName,
      });
      onSuccess(method);
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Card Number"
        type="text"
        placeholder="1234 5678 9012 3456"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry Date"
          type="text"
          placeholder="MM/YY"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
        />
        <Input
          label="CVV"
          type="text"
          placeholder="123"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          required
        />
      </div>
      <Input
        label="Cardholder Name"
        type="text"
        placeholder="John Doe"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        required
      />
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          Add Card
        </Button>
      </div>
    </form>
  );
};

export default RideBooking;