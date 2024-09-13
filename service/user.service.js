const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const jwt = require('jsonwebtoken');
const config = require('../../config/env.config');

exports.createUser = async (userData) => {
    try {
    
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await User.create({
            user_name: userData.user_name,
            phone_number: userData.phone_number,
            email: userData.email,
            role_id: userData.role_id,
            password: hashedPassword,
        });
        return user;
    } catch (error) {
        console.error('Error creating user in service:', error);
        throw error;
    }
};

exports.getUser = async (query) => {
    try {
        const user = await User.findOne({ where: query });
        return user;
    } catch (error) {
        throw new Error(`Error while fetching user: ${error.message}`);
    }
};
exports.getAdminUser = async () => {
    try {
      // Assuming role_id 1 is for Admin
      const admin = await User.findOne({ where: { role_id: 1 } });
      return admin;
    } catch (error) {
      console.error('Error fetching admin user:', error);
      throw error;
    }
  };
exports.loginWithPassword = async (user_id, password) => {
    try {
        const user = await User.findOne({ where: { user_id } });
        if (!user) {
            throw new Error('Invalid user_id or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid user_id or password');
        }
        const auth_code = jwt.sign({ user_id: user.user_id }, config.JWT_SECRET, { expiresIn: '1h' });
        return auth_code;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

exports.changePassword = async (user_id, old_password, new_password) => {
    try {
        const user = await User.findOne({ where: { user_id } });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return false;
        }
        const hashedNewPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedNewPassword;
        await user.save();
        return true;
    } catch (error) {
        throw new Error(`Error changing password: ${error.message}`);
    }
};

exports.verifyAuthCode = async (auth_code) => {
    try {
        const decoded = jwt.verify(auth_code, config.JWT_SECRET);
        return decoded;
    } catch (error) {

        throw new Error('Invalid auth_code.');
    }
};

exports.generateRefreshToken = async (user_id) => {
    try {
        const newRefreshToken = jwt.sign({ userId: user_id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return newRefreshToken;
    } catch (error) {
        console.error('Error generating refresh_token:', error);
        throw new Error('Error generating refresh token.');
    }
};
