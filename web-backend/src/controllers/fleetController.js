exports.list = async (req, res) =>
  res.json({ success: true, message: 'Fleet list fetched.', data: [] });
