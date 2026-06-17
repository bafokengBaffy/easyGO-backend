const { User, Ride, Payment, AuditLog, Sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const storageService = require('../services/storageService');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * User Controller - Handles user profile and administrative management
 */
class UserController {
  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) throw new NotFoundError('User');
    return sendResponse(res, 200, user);
  });

  /**
   * Update current user profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new NotFoundError('User');

    // Prevent role escalation via profile update
    delete req.body.role;
    delete req.body.email;

    await user.update(req.body);
    return sendResponse(res, 200, user, 'Profile updated successfully');
  });

  /**
   * Get all users (Admin only)
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['createdAt', 'DESC']]
    });
    return sendResponse(res, 200, users);
  });

  /**
   * Get specific user by ID (Admin only)
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) throw new NotFoundError('User');
    return sendResponse(res, 200, user);
  });

  /**
   * Suspend a user account (Admin only)
   */
  suspendUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new NotFoundError('User');
    
    await user.update({ is_active: false });
    return sendResponse(res, 200, null, 'User account suspended');
  });

  /**
   * Activate a user account (Admin only)
   */
  activateUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new NotFoundError('User');
    
    await user.update({ is_active: true });
    return sendResponse(res, 200, null, 'User account activated');
  });

  /**
   * Handle avatar upload to Cloudinary
   */
  updateProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) throw new BadRequestError('No image provided');
    
    const result = await storageService.uploadFile(req.file, `users/${req.user.id}/avatars`);
    const user = await User.findByPk(req.user.id);
    await user.update({ avatar_url: result.secure_url });

    return sendResponse(res, 200, { avatar_url: result.secure_url }, 'Profile photo updated');
  });

  /**
   * Fetch user-specific statistics
   */
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await Ride.findOne({
      where: { rider_id: req.user.id },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRides'],
        [Sequelize.fn('SUM', Sequelize.col('fare_amount')), 'totalSpent']
      ],
      raw: true
    });
    return sendResponse(res, 200, stats);
  });

  // Placeholder methods for expanded features
  getRideHistory = asyncHandler(async (req, res) => {
    const rides = await Ride.findAll({
      where: { rider_id: req.user.id },
      include: ['Driver'],
      order: [['createdAt', 'DESC']]
    });
    return sendResponse(res, 200, rides);
  });

  getPaymentHistory = asyncHandler(async (req, res) => {
    const payments = await Payment.findAll({
      include: [{
        model: Ride,
        as: 'ride',
        where: { rider_id: req.user.id }
      }],
      order: [['createdAt', 'DESC']]
    });
    return sendResponse(res, 200, payments);
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestError('Current password incorrect');
    }

    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await emailService.sendSecurityAlert(user.email, 'Password Change');
    return sendResponse(res, 200, null, 'Password updated successfully');
  });

  deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    // Soft delete strategy
    await user.update({ is_active: false, status: 'deleted' });
    
    logger.info(`User ${user.id} requested account deletion`);
    return sendResponse(res, 200, null, 'Account successfully deactivated');
  });

  /**
   * Get user audit logs (Admin only)
   */
  getUserAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.findAll({
      where: { user_id: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    return sendResponse(res, 200, logs);
  });

  /**
   * Update user role (Admin only)
   */
  updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) throw new NotFoundError('User');

    await user.update({ role });
    return sendResponse(res, 200, user, `User role updated to ${role}`);
  });

  /**
   * Register device for push notifications
   */
  registerDevice = asyncHandler(async (req, res) => {
    const { deviceId, deviceName, deviceType, pushToken } = req.body;
    const user = await User.findByPk(req.user.id);
    
    const devices = user.metadata?.devices || [];
    const existingIndex = devices.findIndex(d => d.deviceId === deviceId);
    
    const deviceData = { deviceId, deviceName, deviceType, pushToken, lastUsed: new Date() };
    
    if (existingIndex > -1) {
      devices[existingIndex] = deviceData;
    } else {
      devices.push(deviceData);
    }

    await user.update({ metadata: { ...user.metadata, devices } });
    return sendResponse(res, 200, deviceData, 'Device registered successfully');
  });

  /**
   * Remove device
   */
  removeDevice = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const user = await User.findByPk(req.user.id);
    
    const devices = (user.metadata?.devices || []).filter(d => d.deviceId !== deviceId);
    
    await user.update({ metadata: { ...user.metadata, devices } });
    return sendResponse(res, 200, null, 'Device removed');
  });
}

module.exports = new UserController();