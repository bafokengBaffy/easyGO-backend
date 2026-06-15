const supportService = require('../services/supportService');
const { ok } = require('../utils/apiResponse');

exports.create = async (req, res, next) => {
  try {
    return ok(res, await supportService.createTicket({ ...req.body, user_id: req.user?.id || req.body.user_id }), 'Ticket created.', 201);
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    return ok(res, await supportService.listTickets(), 'Tickets fetched.');
  } catch (e) {
    return next(e);
  }
};
