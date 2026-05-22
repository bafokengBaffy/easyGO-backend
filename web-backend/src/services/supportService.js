const { SupportTicket } = require('../models');

const createTicket = async (payload) => SupportTicket.create(payload);
const listTickets = async () => SupportTicket.findAll({ order: [['created_at', 'DESC']] });

module.exports = { createTicket, listTickets };
