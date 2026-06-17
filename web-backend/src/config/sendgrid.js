const logger = require('./logger');
const sgMail = require('@sendgrid/mail');

function init() {
	const key = process.env.SENDGRID_API_KEY;
	if (!key) {
		logger.warn('SendGrid API key missing');
		return false;
	}
	sgMail.setApiKey(key);
	return true;
}

module.exports = { init, sgMail };
