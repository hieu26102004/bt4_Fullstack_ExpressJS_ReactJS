const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let FavoriteProduct;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  
  const favoriteProductSchema = new mongoose.Schema({
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  // Đảm bảo mỗi user chỉ có thể yêu thích một sản phẩm một lần
  favoriteProductSchema.index({ userId: 1, productId: 1 }, { unique: true });
  favoriteProductSchema.index({ userId: 1, createdAt: -1 });

  FavoriteProduct = mongoose.model('FavoriteProduct', favoriteProductSchema);
  
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  
  FavoriteProduct = sequelize.define('FavoriteProduct', {
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
    }
  }, {
    tableName: 'favorite_products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'productId']
      },
      {
        fields: ['userId', 'createdAt']
      }
    ]
  });
}

module.exports = FavoriteProduct;