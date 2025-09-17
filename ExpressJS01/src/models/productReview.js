const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let ProductReview;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  
  const productReviewSchema = new mongoose.Schema({
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    isApproved: {
      type: Boolean,
      default: true // Change to true for development
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

  productReviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  // Index để query hiệu quả
  productReviewSchema.index({ productId: 1, createdAt: -1 });
  productReviewSchema.index({ userId: 1, productId: 1 });
  productReviewSchema.index({ isApproved: 1 });

  ProductReview = mongoose.model('ProductReview', productReviewSchema);
  
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  
  ProductReview = sequelize.define('ProductReview', {
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'product_reviews',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['productId', 'createdAt']
      },
      {
        fields: ['userId', 'productId']
      },
      {
        fields: ['isApproved']
      }
    ]
  });
}

module.exports = ProductReview;