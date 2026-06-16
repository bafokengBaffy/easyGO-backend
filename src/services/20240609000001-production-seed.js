'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminId = uuidv4();
    const passwordHash = await bcrypt.hash('Admin@EasyGo2026', 12);

    // 1. Seed Roles/Users
    await queryInterface.bulkInsert('users', [{
      id: adminId,
      name: 'System Administrator',
      email: 'admin@easygo.ls',
      phone: '+26650000000',
      password_hash: passwordHash,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // 2. Seed Initial Zones (Maseru Central)
    await queryInterface.bulkInsert('zones', [{
      id: uuidv4(),
      name: 'Maseru Central',
      base_fare: 15.00,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // 3. Seed Promotions
    await queryInterface.bulkInsert('promotions', [{
      code: 'WELCOME2026',
      discount_type: 'percent',
      discount_value: 20.00,
      is_active: true,
      starts_at: new Date(),
      ends_at: new Date('2026-12-31'),
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};