// src/pages/rider/SavedPlaces.jsx
import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Star, MapPin, Plus, Edit2, Trash2, Navigation, Clock } from 'lucide-react';
import { userService } from '@/services/user.service';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { getAutocompletePredictions, getPlaceDetails } from '@/utils/mapUtils';
import toast from 'react-hot-toast';

const SavedPlaces = () => {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    lat: null,
    lng: null,
    type: 'other',
    instructions: ''
  });

  useEffect(() => {
    fetchSavedPlaces();
  }, []);

  const fetchSavedPlaces = async () => {
    setLoading(true);
    try {
      const places = await userService.getSavedPlaces();
      setSavedPlaces(places);
    } catch (error) {
      console.error('Failed to fetch saved places:', error);
      toast.error('Failed to load saved places');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await getAutocompletePredictions(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPlace = async (placeId) => {
    setSearching(true);
    try {
      const placeDetails = await getPlaceDetails(placeId);
      setFormData({
        ...formData,
        address: placeDetails.address,
        lat: placeDetails.location.lat,
        lng: placeDetails.location.lng
      });
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to get place details:', error);
      toast.error('Failed to get address details');
    } finally {
      setSearching(false);
    }
  };

  const handleSavePlace = async () => {
    if (!formData.address || !formData.label) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingPlace) {
        await userService.updateSavedPlace(editingPlace.id, formData);
        toast.success('Place updated successfully');
      } else {
        await userService.addSavedPlace(formData);
        toast.success('Place saved successfully');
      }
      
      setShowAddModal(false);
      resetForm();
      fetchSavedPlaces();
    } catch (error) {
      toast.error(editingPlace ? 'Failed to update place' : 'Failed to save place');
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this saved place?')) {
      try {
        await userService.deleteSavedPlace(placeId);
        toast.success('Place deleted successfully');
        fetchSavedPlaces();
      } catch (error) {
        toast.error('Failed to delete place');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      address: '',
      lat: null,
      lng: null,
      type: 'other',
      instructions: ''
    });
    setEditingPlace(null);
  };

  const handleEdit = (place) => {
    setEditingPlace(place);
    setFormData({
      label: place.label,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      type: place.type,
      instructions: place.instructions || ''
    });
    setShowAddModal(true);
  };

  const getTypeIcon = (type) => {
    const icons = {
      home: <Home className="w-5 h-5" />,
      work: <Briefcase className="w-5 h-5" />,
      favorite: <Star className="w-5 h-5" />,
      other: <MapPin className="w-5 h-5" />
    };
    return icons[type] || icons.other;
  };

  const getTypeColor = (type) => {
    const colors = {
      home: 'bg-blue-100 text-blue-600',
      work: 'bg-purple-100 text-purple-600',
      favorite: 'bg-yellow-100 text-yellow-600',
      other: 'bg-gray-100 text-gray-600'
    };
    return colors[type] || colors.other;
  };

  const PlaceCard = ({ place }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${getTypeColor(place.type)}`}>
            {getTypeIcon(place.type)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{place.label}</h3>
            <p className="text-gray-600 text-sm mt-1">{place.address}</p>
            {place.instructions && (
              <p className="text-gray-400 text-xs mt-2 flex items-center">
                <Navigation className="w-3 h-3 mr-1" />
                {place.instructions}
              </p>
            )}
            {place.lastUsed && (
              <p className="text-gray-400 text-xs mt-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Last used: {new Date(place.lastUsed).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(place)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeletePlace(place.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Places</h1>
            <p className="text-gray-600 mt-2">Quickly access your frequently visited locations</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowAddModal(true);
          }} icon={Plus}>
            Add New Place
          </Button>
        </div>

        {/* Places Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No saved places</h3>
            <p className="text-gray-500 mb-4">Save your favorite locations for quick access</p>
            <Button onClick={() => setShowAddModal(true)}>
              Add Your First Place
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Place Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingPlace ? 'Edit Place' : 'Add New Place'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['home', 'work', 'favorite', 'other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`p-3 rounded-lg border-2 text-center capitalize transition-all ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {getTypeIcon(type)}
                    <span className="text-xs mt-1">{type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Place Name"
            placeholder="e.g., Home, Office, Gym"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              placeholder="Search for an address..."
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                handleSearch(e.target.value);
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectPlace(result.placeId)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  >
                    <p className="font-medium">{result.structuredFormatting?.mainText}</p>
                    <p className="text-sm text-gray-500">{result.structuredFormatting?.secondaryText}</p>
                  </button>
                ))}
              </div>
            )}
            
            {searching && (
              <div className="mt-2 text-center text-gray-500">Searching...</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              placeholder="e.g., Gate code, building number, landmark"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleSavePlace} fullWidth>
              {editingPlace ? 'Update Place' : 'Save Place'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SavedPlaces;