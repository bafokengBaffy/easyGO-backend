const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { ValidationError } = require('../utils/apiError');

const register = asyncHandler(async (req, res) => {
  const { email, password, phone, first_name, last_name } = req.body;
  
  if (!email || !password || !phone || !first_name || !last_name) {
    throw new ValidationError('Missing required fields');
  }
  
  const result = await authService.register({
    email,
    password_hash: password,
    phone,
    first_name,
    last_name,
    role: 'rider'
  });
  
  res.status(201).json({
    success: true,
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }
  
  const result = await authService.login(email, password);
  
  res.json({
    success: true,
    data: result
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new ValidationError('Refresh token required');
  }
  
  const tokens = await authService.refreshToken(refreshToken);
  
  res.json({
    success: true,
    data: tokens
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  await authService.logout(req.user.id, refreshToken);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile
};
