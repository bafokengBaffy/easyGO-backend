const { User, Ride, Payment, Sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const storageService = require('../services/storageService');

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
    return sendResponse(res, 501, null, 'Method not implemented');
  });

  deleteAccount = asyncHandler(async (req, res) => {
    return sendResponse(res, 501, null, 'Account deletion requires verification');
  });
}

module.exports = new UserController();