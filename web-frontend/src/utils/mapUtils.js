// src/utils/mapUtils.js
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY
      }
    });
    
    if (response.data.results && response.data.results[0]) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });
    
    if (response.data.results && response.data.results[0]) {
      return response.data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const getDirections = async (origin, destination, waypoints = []) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        waypoints: waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|'),
        key: GOOGLE_MAPS_API_KEY
      }
    });
    
    if (response.data.routes && response.data.routes[0]) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        distance: leg.distance.value, // meters
        duration: leg.duration.value, // seconds
        polyline: route.overview_polyline.points,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text,
          location: step.start_location
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

export const calculateETA = (distance, mode = 'driving') => {
  // Average speeds in km/h
  const speeds = {
    driving: 40,
    walking: 5,
    bicycling: 15
  };
  
  const speed = speeds[mode] || speeds.driving;
  const hours = distance / speed;
  const minutes = Math.round(hours * 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours_num = Math.floor(minutes / 60);
  const remaining_minutes = minutes % 60;
  return `${hours_num}h ${remaining_minutes}m`;
};

export const getAutocompletePredictions = async (input, location = null, radius = 50000) => {
  if (!input || input.length < 3) return [];
  
  try {
    const params = {
      input,
      key: GOOGLE_MAPS_API_KEY,
      types: 'address'
    };
    
    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = radius;
    }
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', { params });
    
    if (response.data.predictions) {
      return response.data.predictions.map(prediction => ({
        description: prediction.description,
        placeId: prediction.place_id,
        structuredFormatting: prediction.structured_formatting
      }));
    }
    return [];
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: 'formatted_address,geometry,name,place_id,plus_code,types'
      }
    });
    
    if (response.data.result) {
      const result = response.data.result;
      return {
        address: result.formatted_address,
        name: result.name,
        location: result.geometry.location,
        placeId: result.place_id,
        types: result.types
      };
    }
    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

export const formatMapUrl = (lat, lng, zoom = 15) => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x400&key=${GOOGLE_MAPS_API_KEY}`;
};