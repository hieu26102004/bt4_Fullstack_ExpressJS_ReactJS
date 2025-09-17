const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let ProductPurchase;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  
  const productPurchaseSchema = new mongoose.Schema({
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
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  });

  // Index để thống kê hiệu quả
  productPurchaseSchema.index({ productId: 1, orderStatus: 1 });
  productPurchaseSchema.index({ userId: 1, purchaseDate: -1 });
  productPurchaseSchema.index({ purchaseDate: -1 });

  ProductPurchase = mongoose.model('ProductPurchase', productPurchaseSchema);
  
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  
  ProductPurchase = sequelize.define('ProductPurchase', {
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    orderStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
      defaultValue: 'pending'
    },
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'product_purchases',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['productId', 'orderStatus']
      },
      {
        fields: ['userId', 'purchaseDate']
      },
      {
        fields: ['purchaseDate']
      }
    ]
  });
}

module.exports = ProductPurchase;