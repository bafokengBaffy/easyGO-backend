const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Payment', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    ride_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    provider: { type: DataTypes.ENUM('stripe', 'cash', 'wallet'), defaultValue: 'stripe' },
    provider_ref: { type: DataTypes.STRING(190), allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'USD' },
    status: { type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded'), defaultValue: 'pending' },
  });
