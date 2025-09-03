const categoryService = require('../services/categoryService');

const categoryController = {
  // Lấy tất cả danh mục
  async getAllCategories(req, res) {
    try {
      const result = await categoryService.getAllCategories();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllCategories controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy danh mục theo ID
  async getCategoryById(req, res) {
    try {
      const { categoryId } = req.params;

      const result = await categoryService.getCategoryById(categoryId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getCategoryById controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy danh mục theo slug
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      const result = await categoryService.getCategoryBySlug(slug);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getCategoryBySlug controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
};

module.exports = categoryController;
