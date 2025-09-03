const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let Category;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const categorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  categorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  Category = mongoose.model('Category', categorySchema);
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  
  Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });
}

module.exports = Category;
