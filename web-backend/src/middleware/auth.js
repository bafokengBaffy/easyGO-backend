const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/apiError');
const { User } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, config.JWT.secret);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (!user.is_active) {
      throw new AuthenticationError('Account is deactivated');
    }
    
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT.secret);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, optionalAuth };
