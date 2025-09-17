const ProductReview = require('../models/productReview');
const ProductPurchase = require('../models/productPurchase');
const Product = require('../models/product');
const User = require('../models/user');
const mongoose = require('mongoose');
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

class ProductStatsService {
  // Thêm review cho sản phẩm
  async addProductReview(userId, productId, rating, comment) {
    try {
      // Kiểm tra xem user đã review sản phẩm này chưa
      const existingReview = await ProductReview.findOne({
        userId: userId,
        productId: productId
      });

      if (existingReview) {
        throw new Error('You have already reviewed this product');
      }

      // Tạo review mới
      const review = new ProductReview({
        userId: userId,
        productId: productId,
        rating: rating,
        comment: comment
      });

      await review.save();

      // Cập nhật rating và reviewCount trong Product
      await this.updateProductRating(productId);

      if (DB_TYPE === 'mongodb') {
        return await ProductReview.findById(review._id).populate('userId', 'name email');
      } else {
        return await ProductReview.findByPk(review.id, {
          include: [{ model: User, attributes: ['name', 'email'] }]
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật rating trung bình của sản phẩm
  async updateProductRating(productId) {
    try {
      if (DB_TYPE === 'mongodb') {
        const stats = await ProductReview.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            }
          }
        ]);

        const avgRating = stats[0] ? stats[0].averageRating : 0;
        const totalReviews = stats[0] ? stats[0].totalReviews : 0;

        await Product.findByIdAndUpdate(productId, {
          rating: Math.round(avgRating * 10) / 10, // Làm tròn đến 1 chữ số thập phân
          reviewCount: totalReviews
        });
      } else {
        const stats = await ProductReview.findAll({
          where: { productId: productId, isApproved: true },
          attributes: [
            [ProductReview.sequelize.fn('AVG', ProductReview.sequelize.col('rating')), 'averageRating'],
            [ProductReview.sequelize.fn('COUNT', ProductReview.sequelize.col('id')), 'totalReviews']
          ],
          raw: true
        });

        const avgRating = stats[0] ? parseFloat(stats[0].averageRating) : 0;
        const totalReviews = stats[0] ? parseInt(stats[0].totalReviews) : 0;

        await Product.update(
          { 
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: totalReviews
          },
          { where: { id: productId } }
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy reviews của sản phẩm
  async getProductReviews(productId, page = 1, limit = 10, onlyApproved = true) {
    try {
      const skip = (page - 1) * limit;
      const filter = { productId: productId };
      
      if (onlyApproved) {
        filter.isApproved = true;
      }

      if (DB_TYPE === 'mongodb') {
        const reviews = await ProductReview.find(filter)
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await ProductReview.countDocuments(filter);

        return {
          reviews,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        };
      } else {
        const { rows: reviews, count: total } = await ProductReview.findAndCountAll({
          where: filter,
          include: [{ model: User, attributes: ['name', 'email'] }],
          order: [['createdAt', 'DESC']],
          offset: skip,
          limit: limit
        });

        return {
          reviews,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Thêm purchase record
  async addProductPurchase(userId, productId, quantity, price) {
    try {
      const totalAmount = quantity * price;
      
      const purchase = new ProductPurchase({
        userId: userId,
        productId: productId,
        quantity: quantity,
        price: price,
        totalAmount: totalAmount
      });

      await purchase.save();

      // Cập nhật purchaseCount trong Product
      if (DB_TYPE === 'mongodb') {
        await Product.findByIdAndUpdate(productId, {
          $inc: { purchaseCount: quantity }
        });
      } else {
        await Product.increment('purchaseCount', { 
          by: quantity,
          where: { id: productId } 
        });
      }

      return purchase;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái purchase
  async updatePurchaseStatus(purchaseId, status) {
    try {
      if (DB_TYPE === 'mongodb') {
        const purchase = await ProductPurchase.findByIdAndUpdate(
          purchaseId,
          { orderStatus: status },
          { new: true }
        );
        return purchase;
      } else {
        await ProductPurchase.update(
          { orderStatus: status },
          { where: { id: purchaseId } }
        );
        return await ProductPurchase.findByPk(purchaseId);
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê sản phẩm
  async getProductStats(productId) {
    try {
      if (DB_TYPE === 'mongodb') {
        // Lấy thông tin cơ bản từ Product
        const product = await Product.findById(productId);
        
        // Thống kê purchases
        const purchaseStats = await ProductPurchase.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(productId) } },
          {
            $group: {
              _id: '$orderStatus',
              count: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              totalAmount: { $sum: '$totalAmount' }
            }
          }
        ]);

        // Thống kê rating
        const ratingStats = await ProductReview.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 }
            }
          }
        ]);

        return {
          productInfo: {
            viewCount: product.viewCount,
            favoriteCount: product.favoriteCount,
            purchaseCount: product.purchaseCount,
            rating: product.rating,
            reviewCount: product.reviewCount
          },
          purchaseStats,
          ratingStats
        };
      } else {
        // MySQL implementation
        const product = await Product.findByPk(productId);
        
        const purchaseStats = await ProductPurchase.findAll({
          where: { productId: productId },
          attributes: [
            'orderStatus',
            [ProductPurchase.sequelize.fn('COUNT', ProductPurchase.sequelize.col('id')), 'count'],
            [ProductPurchase.sequelize.fn('SUM', ProductPurchase.sequelize.col('quantity')), 'totalQuantity'],
            [ProductPurchase.sequelize.fn('SUM', ProductPurchase.sequelize.col('totalAmount')), 'totalAmount']
          ],
          group: ['orderStatus'],
          raw: true
        });

        const ratingStats = await ProductReview.findAll({
          where: { productId: productId, isApproved: true },
          attributes: [
            'rating',
            [ProductReview.sequelize.fn('COUNT', ProductReview.sequelize.col('id')), 'count']
          ],
          group: ['rating'],
          raw: true
        });

        return {
          productInfo: {
            viewCount: product.viewCount,
            favoriteCount: product.favoriteCount,
            purchaseCount: product.purchaseCount,
            rating: product.rating,
            reviewCount: product.reviewCount
          },
          purchaseStats,
          ratingStats
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Approve/reject review
  async moderateReview(reviewId, isApproved) {
    try {
      if (DB_TYPE === 'mongodb') {
        const review = await ProductReview.findByIdAndUpdate(
          reviewId,
          { isApproved: isApproved },
          { new: true }
        );
        
        // Cập nhật lại rating của sản phẩm
        await this.updateProductRating(review.productId);
        
        return review;
      } else {
        const review = await ProductReview.findByPk(reviewId);
        await review.update({ isApproved: isApproved });
        
        // Cập nhật lại rating của sản phẩm
        await this.updateProductRating(review.productId);
        
        return review;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductStatsService();