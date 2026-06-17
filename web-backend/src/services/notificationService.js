const adapters = require('../adapters');
const pushService = require('./pushNotificationService');
const logger = require('../config/logger');

/**
 * Notification service coordinates email, SMS and push notifications
 */

async function sendEmail({ to, subject, template, templateData }) {
	if (!to || !subject) throw new Error('to and subject required');
	try {
		return await adapters.email.send({ to, subject, template, templateData });
	} catch (err) {
		logger.error('sendEmail failed', { to, err: err.message });
		throw err;
	}
}

async function sendSms({ to, body }) {
	if (!to || !body) throw new Error('to and body required');
	try {
		return await adapters.sms.sendSms({ to, body });
	} catch (err) {
		logger.error('sendSms failed', { to, err: err.message });
		throw err;
	}
}

async function sendPush({ token, payload }) {
	if (!token || !payload) throw new Error('token and payload required');
	try {
		return await pushService.sendToDevice({ token, payload });
	} catch (err) {
		logger.error('sendPush failed', { token, err: err.message });
		throw err;
	}
}

module.exports = {
	sendEmail,
	sendSms,
	sendPush,
};
