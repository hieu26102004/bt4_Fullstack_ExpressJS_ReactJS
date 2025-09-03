const Category = require('../models/category');

const categoryService = {
  // Lấy tất cả danh mục
  async getAllCategories() {
    try {
      const categories = await Category.find({ isActive: true })
        .sort({ name: 1 })
        .lean();

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy danh sách danh mục',
        error: error.message
      };
    }
  },

  // Lấy danh mục theo ID
  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId).lean();

      if (!category) {
        return {
          success: false,
          message: 'Không tìm thấy danh mục'
        };
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy thông tin danh mục',
        error: error.message
      };
    }
  },

  // Lấy danh mục theo slug
  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ 
        slug: slug,
        isActive: true 
      }).lean();

      if (!category) {
        return {
          success: false,
          message: 'Không tìm thấy danh mục'
        };
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy thông tin danh mục',
        error: error.message
      };
    }
  }
};

module.exports = categoryService;
