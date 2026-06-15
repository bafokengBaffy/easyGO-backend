const express = require('express');
const mpesaWebhook = require('../../webhooks/mpesaWebhook');
const ecocashWebhook = require('../../webhooks/ecocashWebhook');

const router = express.Router();
router.post('/mpesa/result', mpesaWebhook.validateMpesaWebhook, mpesaWebhook.handleMpesaResult);
router.post('/mpesa/timeout', mpesaWebhook.validateMpesaWebhook, mpesaWebhook.handleMpesaTimeout);
router.post('/ecocash', ecocashWebhook.validateEcoCashWebhook, ecocashWebhook.handleEcoCashWebhook);

module.exports = router;
