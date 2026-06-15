const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('User', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    firebase_uid: { type: DataTypes.STRING(128), allowNull: true, unique: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: true },
    role: { type: DataTypes.ENUM('admin', 'driver', 'rider', 'support'), allowNull: false, defaultValue: 'rider' },
    phone: { type: DataTypes.STRING(32), allowNull: true },
    avatar_url: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM('active', 'suspended', 'pending'), defaultValue: 'active' },
    last_login: { type: DataTypes.DATE, allowNull: true },
  });
