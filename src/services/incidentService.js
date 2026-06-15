const BaseService = require('./base.service');
const incidentRepository = require('../repositories/incident.repository');

class IncidentService extends BaseService {
  constructor() {
    super(incidentRepository);
  }

  async reportIncident(data) {
    return await this.create({
      ...data,
      status: 'open',
      reported_at: new Date()
    });
  }

  async resolveIncident(id, resolutionData) {
    return await this.update(id, { ...resolutionData, status: 'resolved', resolved_at: new Date() });
  }
}

module.exports = new IncidentService();