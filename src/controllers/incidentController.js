exports.list = async (req, res) => res.json({ success: true, message: 'Incidents fetched.', data: [] });
exports.create = async (req, res) => res.status(201).json({ success: true, message: 'Incident created.', data: req.body });
