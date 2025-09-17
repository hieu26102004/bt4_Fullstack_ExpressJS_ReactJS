const productStatsService = require('../services/productStatsService');

const productStatsController = {
  // Thêm review cho sản phẩm
  async addProductReview(req, res) {
    try {
      const { productId } = req.params; // Get from URL params
      const { rating, comment } = req.body; // Get from request body
      const userId = req.user.id;

      console.log('Add review request:', { userId, productId, rating, comment });

      // Validate productId
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const review = await productStatsService.addProductReview(
        userId, 
        productId, 
        rating, 
        comment
      );
      
      console.log('Review created successfully:', review);
      
      res.status(201).json({
        success: true,
        message: 'Product review added successfully',
        data: review
      });
    } catch (error) {
      console.error('Error adding product review:', error);
      console.error('Error stack:', error.stack);
      
      if (error.message === 'You have already reviewed this product') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to add product review',
        error: error.message
      });
    }
  },

  // Lấy reviews của sản phẩm
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, onlyApproved = 'true' } = req.query;

      console.log('Get reviews request:', { productId, page, limit, onlyApproved });

      const result = await productStatsService.getProductReviews(
        productId,
        parseInt(page),
        parseInt(limit),
        onlyApproved === 'true'
      );
      
      console.log('Reviews result:', result);
      
      res.status(200).json({
        success: true,
        message: 'Product reviews retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error getting product reviews:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to get product reviews',
        error: error.message
      });
    }
  },

  // Thêm purchase record
  async addProductPurchase(req, res) {
    try {
      const { productId, quantity, price } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      if (!price || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number'
        });
      }

      const purchase = await productStatsService.addProductPurchase(
        userId, 
        productId, 
        quantity, 
        price
      );
      
      res.status(201).json({
        success: true,
        message: 'Product purchase recorded successfully',
        data: purchase
      });
    } catch (error) {
      console.error('Error adding product purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record product purchase',
        error: error.message
      });
    }
  },

  // Cập nhật trạng thái purchase
  async updatePurchaseStatus(req, res) {
    try {
      const { purchaseId } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const purchase = await productStatsService.updatePurchaseStatus(purchaseId, status);
      
      res.status(200).json({
        success: true,
        message: 'Purchase status updated successfully',
        data: purchase
      });
    } catch (error) {
      console.error('Error updating purchase status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update purchase status',
        error: error.message
      });
    }
  },

  // Lấy thống kê sản phẩm
  async getProductStats(req, res) {
    try {
      const { productId } = req.params;

      const stats = await productStatsService.getProductStats(productId);
      
      res.status(200).json({
        success: true,
        message: 'Product statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting product stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product statistics',
        error: error.message
      });
    }
  },

  // Approve/reject review (Admin only)
  async moderateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { isApproved } = req.body;

      // Check if user is admin (this should be handled in middleware)
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const review = await productStatsService.moderateReview(reviewId, isApproved);
      
      res.status(200).json({
        success: true,
        message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
        data: review
      });
    } catch (error) {
      console.error('Error moderating review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to moderate review',
        error: error.message
      });
    }
  },

  // Lấy pending reviews (Admin only)
  async getPendingReviews(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      // Get all pending reviews across all products
      const ProductReview = require('../models/productReview');
      const DB_TYPE = process.env.DB_TYPE || 'mongodb';

      if (DB_TYPE === 'mongodb') {
        const skip = (page - 1) * limit;
        const reviews = await ProductReview.find({ isApproved: false })
          .populate('userId', 'name email')
          .populate('productId', 'name slug images')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));

        const total = await ProductReview.countDocuments({ isApproved: false });

        res.status(200).json({
          success: true,
          message: 'Pending reviews retrieved successfully',
          data: {
            reviews,
            pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(total / limit),
              totalItems: total,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      } else {
        // MySQL implementation would go here
        const { rows: reviews, count: total } = await ProductReview.findAndCountAll({
          where: { isApproved: false },
          include: [
            { model: require('../models/user'), attributes: ['name', 'email'] },
            { model: require('../models/product'), attributes: ['name', 'slug', 'images'] }
          ],
          order: [['createdAt', 'DESC']],
          offset: (page - 1) * limit,
          limit: parseInt(limit)
        });

        res.status(200).json({
          success: true,
          message: 'Pending reviews retrieved successfully',
          data: {
            reviews,
            pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(total / limit),
              totalItems: total,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      }
    } catch (error) {
      console.error('Error getting pending reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pending reviews',
        error: error.message
      });
    }
  }
};

module.exports = productStatsController;