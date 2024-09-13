const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const User = require('../models/user.model');

const OTP = sequelize.define('OTP', {
  otp_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  otp: {
    type: DataTypes.INTEGER,
  },
  expiry_time: {
    type: DataTypes.DATE,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  }
}, {
  timestamps: true,
});

OTP.belongsTo(User, { foreignKey: 'user_id' });
module.exports = OTP;
