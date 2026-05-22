exports.list = async (req, res) => res.json({ success: true, message: 'Reviews fetched.', data: [] });
exports.create = async (req, res) => res.status(201).json({ success: true, message: 'Review created.', data: req.body });
