import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import adminService from '../../services/admin.service';
import 'leaflet/dist/leaflet.css';
import './ZoneCreator.css'; // Assume standard styling for layout

/**
 * ZoneCreator Component
 * Allows admins to click points on a map to define a PostGIS-compatible polygon.
 */
const ZoneCreator = () => {
  const [coordinates, setCoordinates] = useState([]); // Stores [[lng, lat], ...]
  const [existingZones, setExistingZones] = useState([]);
  const [zoneName, setZoneName] = useState('');
  const [baseFare, setBaseFare] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const result = await adminService.getAllZones();
      setExistingZones(result.data || []);
    } catch (err) {
      console.error('Failed to fetch existing zones:', err);
    }
  };

  // Default center (Maseru, Lesotho based on context)
  const center = [-29.31, 27.48];

  /**
   * Internal component to handle map click events
   */
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        // Leaflet uses [lat, lng], but our Backend/PostGIS expects [lng, lat]
        const newPoint = [e.latlng.lng, e.latlng.lat];
        setCoordinates((prev) => [...prev, newPoint]);
      },
    });
    return null;
  };

  const resetMap = () => {
    setCoordinates([]);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (coordinates.length < 3) {
      return setMessage({ type: 'error', text: 'A zone must have at least 3 points.' });
    }

    setLoading(true);
    try {
      await adminService.createZone({
        name: zoneName,
        base_fare: parseFloat(baseFare),
        coordinates: coordinates,
      });
      setMessage({ type: 'success', text: 'Geofence zone created successfully!' });
      setCoordinates([]);
      setZoneName('');
      setBaseFare('');
      fetchZones(); // Refresh the list to show the new zone
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error saving zone' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    
    try {
      await adminService.deleteZone(zoneId);
      fetchZones(); // Refresh the map
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error deleting zone' });
    }
  };

  // Convert [lng, lat] back to [lat, lng] for Leaflet display
  const displayPath = coordinates.map((p) => [p[1], p[0]]);

  return (
    <div className="zone-creator-container">
      <div className="admin-controls">
        <h2>Create New Geofence Zone</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Zone Name</label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="e.g. Maseru Central"
              required
            />
          </div>
          <div className="form-group">
            <label>Base Fare (LSL/M)</label>
            <input
              type="number"
              value={baseFare}
              onChange={(e) => setBaseFare(e.target.value)}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>
          <p className="instruction">Click on the map to place vertices for the boundary.</p>
          <div className="button-group">
            <button type="button" onClick={resetMap} className="btn-secondary">Reset</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Zone'}
            </button>
          </div>
        </form>
        {message && <div className={`alert ${message.type}`}>{message.text}</div>}
      </div>

      <div className="map-wrapper">
        <MapContainer center={center} zoom={13} style={{ height: '600px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />

          {/* Display Existing Zones */}
          {existingZones.map((zone) => {
            if (!zone.boundary || !zone.boundary.coordinates) return null;
            const positions = zone.boundary.coordinates[0].map(p => [p[1], p[0]]);
            return (
              <Polygon 
                key={zone.id} 
                positions={positions} 
                pathOptions={{ color: '#666', fillColor: '#666', fillOpacity: 0.3 }}
              >
                <Popup>
                  <strong>{zone.name}</strong><br />
                  Base Fare: {zone.base_fare} LSL<br />
                  <button onClick={() => handleDelete(zone.id)} className="btn-delete-zone">Delete Zone</button>
                </Popup>
              </Polygon>
            );
          })}
          
          {/* Visualize the area as the user clicks */}
          {displayPath.length > 0 && (
            <>
              {displayPath.map((pos, idx) => (
                <Marker key={idx} position={pos} />
              ))}
              {displayPath.length >= 3 && (
                <Polygon positions={displayPath} pathOptions={{ color: '#F5C400', fillColor: '#F5C400' }} />
              )}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default ZoneCreator;