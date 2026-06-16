﻿const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const { BadRequestException, AuthenticationError } = require('../exceptions/api.exception');

/**
 * Register a new user
 */
exports.register = asyncHandler(async (req, res) => {
    const { email, password, name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new BadRequestException('User with this email already exists');
    }

    // The password hashing is handled by the beforeSave hook in user.model.js
    // via the virtual 'password' field setter.
    const user = await User.create({
        name,
        email,
        phone,
        password, // This triggers the virtual setter and subsequent hook
        role: role || 'rider'
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, config.JWT.secret, {
        expiresIn: config.JWT.expiresIn || '24h'
    });

    // Exclude password from response
    const userData = user.toJSON();
    delete userData.password_hash;

    return sendResponse(res, 201, { user: userData, token }, 'User registered successfully');
});

/**
 * Login user
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new AuthenticationError('Invalid credentials');
    }

    // 3. Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT.secret, {
        expiresIn: config.JWT.expiresIn || '24h'
    });

    // 4. Exclude password hash from response
    const userData = user.toJSON();
    delete userData.password_hash;

    return sendResponse(res, 200, { user: userData, token }, 'Logged in successfully');
});