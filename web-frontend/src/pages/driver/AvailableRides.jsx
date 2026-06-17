// src/pages/driver/AvailableRides.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Clock, Users, Filter, Map, List, RefreshCw } from 'lucide-react';
import { driverService } from '@/services/driver.service';
import { useGeolocation } from '@/hooks/useGeolocation';
import Button from '@/components/common/Button';
import { formatCurrency, formatDistance, formatDuration } from '@/utils/formatters';
import toast from 'react-hot-toast';

const AvailableRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    maxDistance: 5,
    minFare: 0,
    vehicleType: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { location, getCurrentPosition } = useGeolocation();

  useEffect(() => {
    if (location) {
      fetchAvailableRides();
    }
  }, [location, filters]);

  const fetchAvailableRides = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const data = await driverService.getAvailableRides(location, filters.maxDistance);
      setRides(data);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      toast.error('Failed to load available rides');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      await driverService.acceptRide(rideId);
      toast.success('Ride accepted! Navigating to pickup location');
      setTimeout(() => {
        window.location.href = `/driver/current-trip/${rideId}`;
      }, 1500);
    } catch (error) {
      toast.error('Failed to accept ride');
    }
  };

  const handleRefresh = () => {
    fetchAvailableRides();
    toast.success('Refreshed ride requests');
  };

  const RideCard = ({ ride }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
            {ride.vehicleType}
          </span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
            {formatDistance(ride.distance)} away
          </span>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(ride.estimatedFare)}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="font-medium">{ride.pickup.address}</p>
          </div>
        </div>
        <div className="flex items-start">
          <Navigation className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="font-medium">{ride.destination.address}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">{ride.passengers} passengers</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{ride.estimatedDuration}</span>
          </div>
        </div>
        <Button onClick={() => handleAcceptRide(ride.id)}>
          Accept Ride
        </Button>
      </div>
    </div>
  );

  const FilterPanel = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Filters</h3>
        <button
          onClick={() => setShowFilters(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Distance: {filters.maxDistance} km
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={filters.maxDistance}
            onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Fare: {formatCurrency(filters.minFare)}
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={filters.minFare}
            onChange={(e) => setFilters({ ...filters, minFare: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type
          </label>
          <select
            value={filters.vehicleType}
            onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="economy">Economy</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="suv">SUV</option>
          </select>
        </div>
      </div>
    </div>
  );

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <MapPin className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Location Required</h2>
        <p className="text-gray-500 mb-4">Please enable location to see available rides</p>
        <Button onClick={getCurrentPosition}>Enable Location</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Rides</h1>
            <p className="text-gray-600 mt-2">
              {rides.length} ride{rides.length !== 1 ? 's' : ''} available nearby
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white rounded-lg shadow flex">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-l-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-r-lg ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
            <Button onClick={handleRefresh} icon={RefreshCw} variant="outline">
              Refresh
            </Button>
            <Button onClick={() => setShowFilters(!showFilters)} icon={Filter} variant="outline">
              Filters
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && <FilterPanel />}

        {/* Rides List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : rides.length > 0 ? (
          <div className="space-y-4">
            {rides.map(ride => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No rides available</h3>
            <p className="text-gray-500">
              There are currently no ride requests in your area.
              Try expanding your search radius or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRides;