const { v4: uuidv4 } = require('uuid');

module.exports = (header = 'X-Correlation-Id') => (req, res, next) => {
	const incoming = req.headers[header.toLowerCase()] || req.headers['x-correlation-id'];
	const correlationId = String(incoming || uuidv4());
	req.correlationId = correlationId;
	res.setHeader(header, correlationId);
	next();
};
