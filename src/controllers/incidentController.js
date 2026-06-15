const incidentService = require('../services/incidentService');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendPagedResponse } = require('../utils/response.util');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };
  const { count, rows } = await incidentService.repository.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
  return sendPagedResponse(res, 200, rows, count, page, limit);
});

exports.create = asyncHandler(async (req, res) => {
  const incident = await incidentService.reportIncident({
    ...req.body,
    reported_by: req.user.id
  });
  return sendResponse(res, 201, incident, 'Incident reported. Support will contact you shortly.');
});
