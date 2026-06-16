/**
 * Database Models Index - Central model registry with associations
 * @version 2.0.0
 */

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const logger = require('../utils/logger');

// Import all models (they should export a function that takes sequelize + DataTypes)
const UserModel = require('./User');
const DriverModel = require('./Driver');
const RideModel = require('./Ride');
const PaymentModel = require('./Payment');
const ReviewModel = require('./Review');
const PromotionModel = require('./Promotion');
const ZoneModel = require('./Zone');
const VehicleModel = require('./Vehicle');
const IncidentModel = require('./Incident');
const SupportTicketModel = require('./SupportTicket');
const AuditLogModel = require('./AuditLog');
const NotificationModel = require('./Notification');
const RefreshTokenModel = require('./RefreshToken');
const WalletModel = require('./Wallet');
const TransactionModel = require('./Transaction');

// Initialize all models with sequelize instance
const User = UserModel(sequelize, DataTypes);
const Driver = DriverModel(sequelize, DataTypes);
const Ride = RideModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);
const Review = ReviewModel(sequelize, DataTypes);
const Promotion = PromotionModel(sequelize, DataTypes);
const Zone = ZoneModel(sequelize, DataTypes);
const Vehicle = VehicleModel(sequelize, DataTypes);
const Incident = IncidentModel(sequelize, DataTypes);
const SupportTicket = SupportTicketModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const RefreshToken = RefreshTokenModel(sequelize, DataTypes);
const Wallet = WalletModel(sequelize, DataTypes);
const Transaction = TransactionModel(sequelize, DataTypes);

// ==================== DEFINE ASSOCIATIONS ====================
// All associations must be defined AFTER all models are initialized

// User Associations
User.hasMany(Ride, { as: 'rides', foreignKey: 'rider_id' });
User.hasMany(Review, { as: 'reviews', foreignKey: 'user_id' });
User.hasOne(Wallet, { as: 'wallet', foreignKey: 'user_id' });
User.hasMany(RefreshToken, { as: 'refreshTokens', foreignKey: 'user_id' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'user_id' });
User.hasMany(AuditLog, { as: 'auditLogs', foreignKey: 'user_id' });

// Driver Associations
Driver.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
Driver.hasMany(Ride, { as: 'rides', foreignKey: 'driver_id' });
Driver.hasOne(Vehicle, { as: 'vehicle', foreignKey: 'driver_id' });
Driver.hasMany(Incident, { as: 'incidents', foreignKey: 'driver_id' });

// Ride Associations
Ride.belongsTo(User, { as: 'rider', foreignKey: 'rider_id' });
Ride.belongsTo(Driver, { as: 'driver', foreignKey: 'driver_id' });
Ride.hasOne(Payment, { as: 'payment', foreignKey: 'ride_id' });
Ride.hasMany(Review, { as: 'reviews', foreignKey: 'ride_id' });
Ride.hasOne(Incident, { as: 'incident', foreignKey: 'ride_id' });
Ride.belongsTo(Promotion, { as: 'promotion', foreignKey: 'promotion_id' });
Ride.belongsTo(Zone, { as: 'zone', foreignKey: 'zone_id' });

// Payment Associations
Payment.belongsTo(Ride, { as: 'ride', foreignKey: 'ride_id' });
Payment.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// Review Associations
Review.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
Review.belongsTo(Ride, { as: 'ride', foreignKey: 'ride_id' });
Review.belongsTo(Driver, { as: 'driver', foreignKey: 'driver_id' });

// Vehicle Associations
Vehicle.belongsTo(Driver, { as: 'driver', foreignKey: 'driver_id' });

// Wallet & Transaction Associations
Wallet.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
Wallet.hasMany(Transaction, { as: 'transactions', foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { as: 'wallet', foreignKey: 'wallet_id' });

// Promotion Associations
Promotion.hasMany(Ride, { as: 'rides', foreignKey: 'promotion_id' });

// Zone Associations
Zone.hasMany(Ride, { as: 'rides', foreignKey: 'zone_id' });
Zone.hasMany(Driver, { as: 'drivers', foreignKey: 'zone_id' });

// Support Ticket Associations
SupportTicket.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
SupportTicket.hasMany(SupportTicket, { as: 'replies', foreignKey: 'parent_id' });

// Notification Associations
Notification.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// RefreshToken Associations
RefreshToken.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// Log successful initialization
logger.info(`✅ Models initialized: ${Object.keys({
  User, Driver, Ride, Payment, Review, Promotion, Zone, 
  Vehicle, Incident, SupportTicket, AuditLog, Notification, 
  RefreshToken, Wallet, Transaction
}).join(', ')}`);

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Driver,
  Ride,
  Payment,
  Review,
  Promotion,
  Zone,
  Vehicle,
  Incident,
  SupportTicket,
  AuditLog,
  Notification,
  RefreshToken,
  Wallet,
  Transaction,
};