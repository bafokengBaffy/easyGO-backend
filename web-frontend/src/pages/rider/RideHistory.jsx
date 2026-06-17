// src/pages/rider/RideHistory.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Navigation, DollarSign, Star, Search, Filter, ChevronRight } from 'lucide-react';
import { userService } from '@/services/user.service';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRideHistory();
  }, [filters]);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      const data = await userService.getRideHistory(filters);
      setRides(data);
    } catch (error) {
      console.error('Failed to fetch ride history:', error);
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      searching: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const RideCard = ({ ride }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedRide(ride)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDateTime(ride.createdAt)}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ride.status)}`}>
          {ride.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-start">
          <MapPin className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-600 truncate">{ride.pickup.address}</p>
        </div>
        <div className="flex items-start">
          <Navigation className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-600 truncate">{ride.destination.address}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t">
        <div>
          {ride.driver && (
            <p className="text-sm text-gray-500">Driver: {ride.driver.name}</p>
          )}
          <p className="text-xs text-gray-400">{ride.distance} • {ride.duration}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(ride.fare)}
          </p>
          {ride.status === 'completed' && !ride.rated && (
            <Button size="sm" onClick={(e) => {
              e.stopPropagation();
              // Open rating modal
            }}>
              Rate Ride
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const RideDetailsModal = ({ ride, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Ride Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Ride Status */}
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(ride.status)}`}>
              {ride.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">{formatDateTime(ride.createdAt)}</span>
          </div>
          
          {/* Route */}
          <div className="space-y-4">
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-16 bg-gray-300"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="font-medium">{ride.pickup.address}</p>
                  {ride.pickup.instructions && (
                    <p className="text-sm text-gray-400 mt-1">{ride.pickup.instructions}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-medium">{ride.destination.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Driver Info */}
          {ride.driver && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Driver Information</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {ride.driver.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{ride.driver.name}</p>
                  <p className="text-sm text-gray-500">{ride.driver.vehicle.model}</p>
                  <p className="text-sm text-gray-500">License: {ride.driver.licensePlate}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Fare Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Fare Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span>{formatCurrency(ride.fareBreakdown?.baseFare || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance ({ride.distance})</span>
                <span>{formatCurrency(ride.fareBreakdown?.distanceCharge || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time ({ride.duration})</span>
                <span>{formatCurrency(ride.fareBreakdown?.timeCharge || 0)}</span>
              </div>
              {ride.fareBreakdown?.surgeMultiplier > 1 && (
                <div className="flex justify-between text-orange-600">
                  <span>Surge ({ride.fareBreakdown.surgeMultiplier}x)</span>
                  <span>{formatCurrency(ride.fareBreakdown.surgeCharge || 0)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(ride.fare)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Method */}
          <div>
            <h3 className="font-semibold mb-2">Payment Method</h3>
            <p className="text-gray-600">{ride.paymentMethod}</p>
          </div>
          
          {/* Rating */}
          {ride.rating && (
            <div>
              <h3 className="font-semibold mb-2">Your Rating</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < ride.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                {ride.feedback && (
                  <p className="ml-3 text-gray-600">"{ride.feedback}"</p>
                )}
              </div>
            </div>
          )}
          
          {/* Receipt Button */}
          <div className="pt-4">
            <Button fullWidth variant="outline">
              Download Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ride History</h1>
          <p className="text-gray-600 mt-2">View all your past and upcoming rides</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Rides</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="in_progress">In Progress</option>
            </select>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
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
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No rides found</h3>
            <p className="text-gray-500">
              {searchTerm || filters.status !== 'all' 
                ? "No rides match your search criteria" 
                : "You haven't taken any rides yet"}
            </p>
            {!searchTerm && filters.status === 'all' && (
              <Button onClick={() => window.location.href = '/rider/book'} className="mt-4">
                Book Your First Ride
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Ride Details Modal */}
      {selectedRide && (
        <RideDetailsModal 
          ride={selectedRide} 
          onClose={() => setSelectedRide(null)} 
        />
      )}
    </div>
  );
};

export default RideHistory;