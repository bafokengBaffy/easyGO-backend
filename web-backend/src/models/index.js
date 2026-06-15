const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Driver = require('./Driver')(sequelize);
const Ride = require('./Ride')(sequelize);
const Payment = require('./Payment')(sequelize);
const Promotion = require('./Promotion')(sequelize);
const Zone = require('./Zone')(sequelize);
const SupportTicket = require('./SupportTicket')(sequelize);
const MobileMoneyTransaction = require('./MobileMoneyTransaction');
const PaymentWebhookLog = require('./PaymentWebhookLog')(sequelize);

User.hasOne(Driver, { foreignKey: 'user_id', as: 'driverProfile' });
Driver.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Ride, { foreignKey: 'rider_id', as: 'rides' });
Ride.belongsTo(User, { foreignKey: 'rider_id', as: 'rider' });
Driver.hasMany(Ride, { foreignKey: 'driver_id', as: 'rides' });
Ride.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

Ride.hasOne(Payment, { foreignKey: 'ride_id', as: 'payment' });
Payment.belongsTo(Ride, { foreignKey: 'ride_id', as: 'ride' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'tickets' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const connectDatabase = async () => {
  await sequelize.authenticate();
  if (process.env.DB_SYNC === 'true') {
    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
  }
};

module.exports = {
  sequelize,
  connectDatabase,
  User,
  Driver,
  Ride,
  Payment,
  Promotion,
  Zone,
  SupportTicket,
  MobileMoneyTransaction,
  PaymentWebhookLog,
};
