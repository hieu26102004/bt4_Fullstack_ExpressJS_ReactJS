const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let ViewedProduct;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  
  const viewedProductSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    viewCount: {
      type: Number,
      default: 1
    },
    lastViewedAt: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  // Index để query hiệu quả
  viewedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });
  viewedProductSchema.index({ userId: 1, lastViewedAt: -1 });

  ViewedProduct = mongoose.model('ViewedProduct', viewedProductSchema);
  
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  
  ViewedProduct = sequelize.define('ViewedProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    lastViewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'viewed_products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'productId']
      },
      {
        fields: ['userId', 'lastViewedAt']
      }
    ]
  });
}

module.exports = ViewedProduct;