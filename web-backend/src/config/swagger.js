const swaggerJsdoc = require('swagger-jsdoc');
const logger = require('./logger');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: process.env.SWAGGER_TITLE || 'EasyGo API',
			version: process.env.SWAGGER_VERSION || '1.0.0',
			description: process.env.SWAGGER_DESC || 'API for EasyGo platform',
		},
		servers: [{ url: process.env.API_BASE_URL || 'http://localhost:3000' }],
	},
	apis: ['src/routes/**/*.js', 'src/controllers/**/*.js'],
};

let spec = null;
try {
	spec = swaggerJsdoc(options);
} catch (err) {
	logger.warn('Failed to generate swagger spec', { err: err.message });
}

module.exports = { spec };
