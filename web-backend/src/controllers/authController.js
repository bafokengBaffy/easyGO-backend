const users = require('../data/mockUsers');

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);

  if (!user || password !== 'password123') {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Use demo@easygo.dev / password123.' });
  }

  return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'This email is already registered.' });
  }

  const newUser = {
    id: `${users.length + 1}`,
    name,
    email,
    role: 'rider',
    location: 'Unknown',
    status: 'Active',
    lastLogin: new Date().toISOString(),
  };

  users.push(newUser);

  return res.status(201).json({ success: true, user: newUser });
};
