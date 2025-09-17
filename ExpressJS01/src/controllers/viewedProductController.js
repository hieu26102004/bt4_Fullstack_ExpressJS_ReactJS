const viewedProductService = require('../services/viewedProductService');

const viewedProductController = {
  // Thêm sản phẩm vào danh sách đã xem
  async addViewedProduct(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user.id; // Từ middleware auth

      const viewedProduct = await viewedProductService.addViewedProduct(userId, productId);
      
      res.status(201).json({
        success: true,
        message: 'Product added to viewed list successfully',
        data: viewedProduct
      });
    } catch (error) {
      console.error('Error adding viewed product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add product to viewed list',
        error: error.message
      });
    }
  },

  // Lấy danh sách sản phẩm đã xem của user
  async getUserViewedProducts(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 12 } = req.query;

      const result = await viewedProductService.getUserViewedProducts(
        userId, 
        parseInt(page), 
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        message: 'User viewed products retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error getting user viewed products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user viewed products',
        error: error.message
      });
    }
  },

  // Xóa sản phẩm khỏi danh sách đã xem
  async removeViewedProduct(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const result = await viewedProductService.removeViewedProduct(userId, productId);
      
      res.status(200).json({
        success: true,
        message: 'Product removed from viewed list successfully',
        data: result
      });
    } catch (error) {
      console.error('Error removing viewed product:', error);
      
      if (error.message === 'Viewed product not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to remove product from viewed list',
        error: error.message
      });
    }
  },

  // Xóa tất cả sản phẩm đã xem
  async clearUserViewedProducts(req, res) {
    try {
      const userId = req.user.id;

      const result = await viewedProductService.clearUserViewedProducts(userId);
      
      res.status(200).json({
        success: true,
        message: 'All viewed products cleared successfully',
        data: result
      });
    } catch (error) {
      console.error('Error clearing viewed products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear viewed products',
        error: error.message
      });
    }
  },

  // Lấy thống kê xem sản phẩm của user
  async getUserViewStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await viewedProductService.getUserViewStats(userId);
      
      res.status(200).json({
        success: true,
        message: 'User view stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting user view stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user view stats',
        error: error.message
      });
    }
  }
};

module.exports = viewedProductController;