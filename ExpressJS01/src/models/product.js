const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let Product;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    images: [{
      type: String
    }],
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
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

  productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  // Index cho tìm kiếm và sort
  productSchema.index({ categoryId: 1, createdAt: -1 });
  productSchema.index({ isActive: 1 });
  productSchema.index({ name: 'text', description: 'text' });

  Product = mongoose.model('Product', productSchema);
} else if (DB_TYPE === 'mysql') {
  const sequelize = require('../config/database');
  const { DataTypes } = require('sequelize');
  
  Product = sequelize.define('Product', {
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['categoryId', 'createdAt']
      },
      {
        fields: ['isActive']
      }
    ]
  });
}

module.exports = Product;
