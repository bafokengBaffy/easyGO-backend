const zoneService = require('../services/zoneService');
const { ok } = require('../utils/apiResponse');

exports.create = async (req, res, next) => {
  try {
    return ok(res, await zoneService.createZone(req.body), 'Zone created.', 201);
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    return ok(res, await zoneService.listZones(), 'Zones fetched.');
  } catch (e) {
    return next(e);
  }
};
