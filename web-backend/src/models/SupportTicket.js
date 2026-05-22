const { DataTypes } = require('sequelize');
module.exports = (sequelize) =>
  sequelize.define('SupportTicket', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    subject: { type: DataTypes.STRING(190), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'), defaultValue: 'open' },
  });
