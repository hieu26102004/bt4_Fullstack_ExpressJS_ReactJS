const similarProductService = require('../services/similarProductService');

const similarProductController = {
  // Lấy sản phẩm tương tự dựa trên category
  async getSimilarProductsByCategory(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 6 } = req.query;

      const similarProducts = await similarProductService.getSimilarProductsByCategory(
        productId, 
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        message: 'Similar products by category retrieved successfully',
        data: similarProducts
      });
    } catch (error) {
      console.error('Error getting similar products by category:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to get similar products by category',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm tương tự dựa trên tags
  async getSimilarProductsByTags(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 6 } = req.query;

      const similarProducts = await similarProductService.getSimilarProductsByTags(
        productId, 
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        message: 'Similar products by tags retrieved successfully',
        data: similarProducts
      });
    } catch (error) {
      console.error('Error getting similar products by tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get similar products by tags',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm tương tự dựa trên khoảng giá
  async getSimilarProductsByPrice(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 6, priceRange = 30 } = req.query;

      const similarProducts = await similarProductService.getSimilarProductsByPriceRange(
        productId, 
        parseInt(priceRange),
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        message: 'Similar products by price retrieved successfully',
        data: similarProducts
      });
    } catch (error) {
      console.error('Error getting similar products by price:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to get similar products by price',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm đề xuất thông minh
  async getRecommendedProducts(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 6 } = req.query;
      const userId = req.user ? req.user.id : null; // Có thể không cần đăng nhập

      const recommendedProducts = await similarProductService.getRecommendedProducts(
        productId, 
        userId,
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        message: 'Recommended products retrieved successfully',
        data: recommendedProducts
      });
    } catch (error) {
      console.error('Error getting recommended products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommended products',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm xu hướng
  async getTrendingProducts(req, res) {
    try {
      const { limit = 10, days = 7 } = req.query;

      const trendingProducts = await similarProductService.getTrendingProducts(
        parseInt(limit),
        parseInt(days)
      );
      
      res.status(200).json({
        success: true,
        message: 'Trending products retrieved successfully',
        data: trendingProducts
      });
    } catch (error) {
      console.error('Error getting trending products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending products',
        error: error.message
      });
    }
  },

  // Lấy tất cả sản phẩm tương tự (tổng hợp)
  async getAllSimilarProducts(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 6 } = req.query;
      const userId = req.user ? req.user.id : null;

      // Lấy song song nhiều loại sản phẩm tương tự
      const [
        similarByCategory,
        similarByTags,
        similarByPrice,
        recommended
      ] = await Promise.all([
        similarProductService.getSimilarProductsByCategory(productId, parseInt(limit)),
        similarProductService.getSimilarProductsByTags(productId, parseInt(limit)),
        similarProductService.getSimilarProductsByPriceRange(productId, 30, parseInt(limit)),
        similarProductService.getRecommendedProducts(productId, userId, parseInt(limit))
      ]);
      
      res.status(200).json({
        success: true,
        message: 'All similar products retrieved successfully',
        data: {
          byCategory: similarByCategory,
          byTags: similarByTags,
          byPrice: similarByPrice,
          recommended: recommended
        }
      });
    } catch (error) {
      console.error('Error getting all similar products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get similar products',
        error: error.message
      });
    }
  }
};

module.exports = similarProductController;