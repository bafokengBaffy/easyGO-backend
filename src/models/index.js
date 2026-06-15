// Model registry with associations
const { sequelize } = require('../config/database');
const User = require('./User');
const Driver = require('./Driver');
const Ride = require('./Ride');
const Payment = require('./Payment');
const Review = require('./Review');
const Promotion = require('./Promotion');
const Zone = require('./Zone');
const Vehicle = require('./Vehicle');
const Incident = require('./Incident');
const SupportTicket = require('./SupportTicket');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const RefreshToken = require('./RefreshToken');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');

// Define associations
User.hasMany(Ride, { as: 'rides', foreignKey: 'rider_id' });
User.hasMany(Review, { as: 'reviews', foreignKey: 'user_id' });
User.hasOne(Wallet, { as: 'wallet', foreignKey: 'user_id' });
User.hasMany(RefreshToken, { as: 'refreshTokens', foreignKey: 'user_id' });

Driver.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
Driver.hasMany(Ride, { as: 'rides', foreignKey: 'driver_id' });
Driver.hasOne(Vehicle, { as: 'vehicle', foreignKey: 'driver_id' });

Ride.belongsTo(User, { as: 'rider', foreignKey: 'rider_id' });
Ride.belongsTo(Driver, { as: 'driver', foreignKey: 'driver_id' });
Ride.hasOne(Payment, { as: 'payment', foreignKey: 'ride_id' });
Ride.hasMany(Review, { as: 'reviews', foreignKey: 'ride_id' });

Payment.belongsTo(Ride, { as: 'ride', foreignKey: 'ride_id' });
Payment.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

Wallet.hasMany(Transaction, { as: 'transactions', foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { as: 'wallet', foreignKey: 'wallet_id' });

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
  Transaction
};
