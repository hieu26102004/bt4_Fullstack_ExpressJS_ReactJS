const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let User;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    resetOTP: String,
    resetOTPExpire: Date,
  });
  User = mongoose.model('user', userSchema);
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetOTP: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetOTPExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });
}

module.exports = User;