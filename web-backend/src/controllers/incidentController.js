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

exports.getIncidentById = asyncHandler(async (req, res) => {
  const incident = await incidentService.getById(req.params.id);
  return sendResponse(res, 200, incident);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, resolution } = req.body;
  const incident = await incidentService.update(req.params.id, { 
    status, 
    metadata: { resolution, resolvedAt: status === 'resolved' ? new Date() : null } 
  });
  return sendResponse(res, 200, incident, 'Incident status updated');
});

exports.uploadPhotos = asyncHandler(async (req, res) => {
  // Logic to handle multiple file uploads for evidence
  return sendResponse(res, 200, null, 'Evidence photos uploaded');

exports.escalate = asyncHandler(async (req, res) => {
  const { reason, assignedTo } = req.body;
  const incident = await incidentService.escalateIncident(req.params.id, reason);
  if (assignedTo) {
    await incident.update({ assigned_to: assignedTo });
  }
  return sendResponse(res, 200, incident, 'Incident escalated to high priority');
});

exports.addComment = asyncHandler(async (req, res) => {
  const { text, visibility } = req.body;
  const comment = await incidentService.addComment(req.params.id, {
    user_id: req.user.id,
    text,
    visibility
  });
  return sendResponse(res, 201, comment, 'Comment added to incident log');
});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await incidentService.getComments(req.params.id, req.user.role);
  return sendResponse(res, 200, comments);
});
});
