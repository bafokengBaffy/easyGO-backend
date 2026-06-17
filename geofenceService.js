const { sequelize } = require('../models');
const logger = require('../utils/logger');

class GeofenceService {
  /**
   * Checks if a driver's location is within any active pickup zones.
   * @param {string} driverId 
   * @param {Object} location { lat, lng }
   */
  async checkDriverZone(driverId, location) {
    try {
      // Query to find if the point is within any zone polygon
      // Note: Assumes 'zones' table has a 'boundary' GEOMETRY(POLYGON) field
      const [zone] = await sequelize.query(
        `SELECT id, name, base_fare 
         FROM zones 
         WHERE is_active = true 
         AND ST_Contains(boundary, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
         LIMIT 1`,
        {
          replacements: { lng: location.lng, lat: location.lat },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (zone) {
        logger.info(`Driver ${driverId} entered zone: ${zone.name}`);
        return zone;
      }
      return null;
    } catch (error) {
      logger.error('Geofencing error:', error);
      return null;
    }
  }
}

module.exports = new GeofenceService();