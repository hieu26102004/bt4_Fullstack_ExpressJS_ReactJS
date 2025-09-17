const favoriteService = require('../services/favoriteService');

const favoriteController = {
  // Thêm sản phẩm vào danh sách yêu thích
  async addToFavorites(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user.id; // Từ middleware auth

      const favorite = await favoriteService.addToFavorites(userId, productId);
      
      res.status(201).json({
        success: true,
        message: 'Product added to favorites successfully',
        data: favorite
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      if (error.message === 'Product is already in favorites') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to add product to favorites',
        error: error.message
      });
    }
  },

  // Xóa sản phẩm khỏi danh sách yêu thích
  async removeFromFavorites(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const result = await favoriteService.removeFromFavorites(userId, productId);
      
      res.status(200).json({
        success: true,
        message: 'Product removed from favorites successfully',
        data: result
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      
      if (error.message === 'Product not found in favorites') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to remove product from favorites',
        error: error.message
      });
    }
  },

  // Lấy danh sách sản phẩm yêu thích của user
  async getUserFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 12 } = req.query;

      const result = await favoriteService.getUserFavorites(
        userId, 
        parseInt(page), 
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        message: 'User favorites retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error getting user favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user favorites',
        error: error.message
      });
    }
  },

  // Kiểm tra xem sản phẩm có được yêu thích không
  async checkFavoriteStatus(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const isFavorite = await favoriteService.isFavorite(userId, productId);
      
      res.status(200).json({
        success: true,
        data: { isFavorite }
      });
    } catch (error) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check favorite status',
        error: error.message
      });
    }
  },

  // Toggle favorite status
  async toggleFavorite(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      const result = await favoriteService.toggleFavorite(userId, productId);
      
      res.status(200).json({
        success: true,
        message: 'Favorite status toggled successfully',
        data: result
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle favorite status',
        error: error.message
      });
    }
  },

  // Lấy số lượng favorites của sản phẩm (public)
  async getFavoriteCount(req, res) {
    try {
      const { productId } = req.params;

      const count = await favoriteService.getFavoriteCount(productId);
      
      res.status(200).json({
        success: true,
        data: { favoriteCount: count }
      });
    } catch (error) {
      console.error('Error getting favorite count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get favorite count',
        error: error.message
      });
    }
  }
};

module.exports = favoriteController;