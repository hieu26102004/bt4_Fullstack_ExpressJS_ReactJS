const productService = require('../services/productService');
const categoryService = require('../services/categoryService');

const productController = {
  // Lấy tất cả sản phẩm với phân trang và filter
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        categoryId,
        categorySlug,
        minPrice,
        maxPrice,
        search
      } = req.query;

      let finalCategoryId = categoryId;

      // Nếu có categorySlug, lấy categoryId từ slug
      if (categorySlug && !categoryId) {
        const categoryResult = await categoryService.getCategoryBySlug(categorySlug);
        if (categoryResult.success) {
          finalCategoryId = categoryResult.data._id;
        }
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        categoryId: finalCategoryId,
        minPrice,
        maxPrice,
        search
      };

      const result = await productService.getAllProducts(options);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllProducts controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm theo danh mục
  async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        search
      };

      const result = await productService.getProductsByCategory(categoryId, options);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getProductsByCategory controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm theo slug danh mục
  async getProductsByCategorySlug(req, res) {
    try {
      const { categorySlug } = req.params;
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
        search
      } = req.query;

      // Lấy thông tin danh mục từ slug
      const categoryResult = await categoryService.getCategoryBySlug(categorySlug);
      if (!categoryResult.success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        search
      };

      const result = await productService.getProductsByCategory(categoryResult.data._id, options);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Thêm thông tin danh mục vào response
      result.data.category = categoryResult.data;

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getProductsByCategorySlug controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy chi tiết sản phẩm
  async getProductDetail(req, res) {
    try {
      const { productId } = req.params;

      const result = await productService.getProductById(productId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Lấy sản phẩm liên quan
      const relatedResult = await productService.getRelatedProducts(
        productId, 
        result.data.categoryId._id || result.data.categoryId,
        6
      );

      const response = {
        success: true,
        data: {
          product: result.data,
          relatedProducts: relatedResult.success ? relatedResult.data : []
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getProductDetail controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy sản phẩm nổi bật
  async getFeaturedProducts(req, res) {
    try {
      const { limit = 8 } = req.query;

      const result = await productService.getFeaturedProducts(parseInt(limit));

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getFeaturedProducts controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // API cho Lazy Loading - Chỉ trả về sản phẩm mới
  async loadMoreProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        categoryId,
        categorySlug,
        minPrice,
        maxPrice,
        search
      } = req.query;

      let finalCategoryId = categoryId;

      // Nếu có categorySlug, lấy categoryId từ slug
      if (categorySlug && !categoryId) {
        const categoryResult = await categoryService.getCategoryBySlug(categorySlug);
        if (categoryResult.success) {
          finalCategoryId = categoryResult.data._id;
        }
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        categoryId: finalCategoryId,
        minPrice,
        maxPrice,
        search
      };

      const result = await productService.getAllProducts(options);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Response cho lazy loading
      return res.status(200).json({
        success: true,
        data: {
          products: result.data.products,
          hasMore: result.data.pagination.hasNextPage,
          currentPage: result.data.pagination.currentPage,
          totalPages: result.data.pagination.totalPages
        }
      });
    } catch (error) {
      console.error('Error in loadMoreProducts controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
};

module.exports = productController;
