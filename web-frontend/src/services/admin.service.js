import apiClient from '../utils/apiClient';

/**
 * AdminService - Handles administrative API interactions
 */
class AdminService {
  /**
   * Persists a new geofence zone to the database
   * @param {Object} zoneData { name, base_fare, coordinates }
   */
  async createZone(zoneData) {
    try {
      const response = await apiClient.post('/admin/zones', zoneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to create geofence zone');
    }
  }

  /**
   * Fetches all defined zones for visualization
   */
  async getAllZones() {
    try {
      const response = await apiClient.get('/admin/zones');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch zones');
    }
  }

  /**
   * Deletes a geofence zone by ID
   * @param {number|string} zoneId 
   */
  async deleteZone(zoneId) {
    try {
      const response = await apiClient.delete(`/admin/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete zone');
    }
  }
}

export default new AdminService();