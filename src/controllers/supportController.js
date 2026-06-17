const supportService = require('../services/supportService');
const { ok, sendResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/apiError');

exports.create = async (req, res, next) => {
  try {
    return ok(res, await supportService.createTicket({ ...req.body, user_id: req.user?.id || req.body.user_id }), 'Ticket created.', 201);
  } catch (e) {
    return next(e);
  }
};

exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await supportService.getById(req.params.id);
  if (!ticket) throw new NotFoundError('Ticket');
  return ok(res, ticket);
});

exports.updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const ticket = await supportService.update(req.params.id, { status });
  return ok(res, ticket, `Ticket status updated to ${status}`);
});

exports.addMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const ticket = await supportService.getById(req.params.id);
  
  const conversation = ticket.metadata?.conversation || [];
  conversation.push({
    senderId: req.user.id,
    text: message,
    timestamp: new Date()
  });

  await ticket.update({ metadata: { ...ticket.metadata, conversation } });
  return ok(res, ticket, 'Message added to ticket');
});

exports.list = async (req, res, next) => {
  try {
    return ok(res, await supportService.listTickets(), 'Tickets fetched.');
  } catch (e) {
    return next(e);
  }
};
