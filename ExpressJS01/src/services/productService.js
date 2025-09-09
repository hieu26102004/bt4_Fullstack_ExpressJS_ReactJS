const Product = require('../models/product');
const Category = require('../models/category');
const elasticSearchService = require('./elasticSearchService');
const { elasticsearchUtils } = require('../config/elasticsearch');

const productService = {
  // Tìm kiếm sản phẩm với Fuzzy Search (Elasticsearch)
  async searchProducts(options = {}) {
    try {
      // Thử sử dụng Elasticsearch trước
      const elasticResult = await elasticSearchService.fuzzySearch(options);
      
      if (elasticResult.success) {
        return elasticResult;
      }
      
      // Fallback to regular MongoDB search nếu Elasticsearch fail
      return await this.getAllProducts(options);
      
    } catch (error) {
      console.error('Error in searchProducts:', error);
      // Fallback to regular search
      return await this.getAllProducts(options);
    }
  },

  // Lấy gợi ý tìm kiếm
  async getSearchSuggestions(query, limit = 10) {
    try {
      return await elasticSearchService.getSearchSuggestions(query, limit);
    } catch (error) {
      console.error('Error in getSearchSuggestions:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy gợi ý tìm kiếm',
        error: error.message
      };
    }
  },

  // Tìm sản phẩm tương tự
  async getSimilarProducts(productId, limit = 6) {
    try {
      const elasticResult = await elasticSearchService.findSimilarProducts(productId, limit);
      
      if (elasticResult.success) {
        return elasticResult;
      }
      
      // Fallback to category-based related products
      const product = await Product.findById(productId);
      if (!product) {
        return { success: false, message: 'Không tìm thấy sản phẩm' };
      }
      
      return await this.getRelatedProducts(productId, product.categoryId, limit);
      
    } catch (error) {
      console.error('Error in getSimilarProducts:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tìm sản phẩm tương tự',
        error: error.message
      };
    }
  },

  // Đồng bộ sản phẩm vào Elasticsearch
  async syncProductToElasticsearch(product) {
    try {
      // Populate category info if needed
      if (typeof product.categoryId === 'string') {
        const populatedProduct = await Product.findById(product._id).populate('categoryId').lean();
        if (populatedProduct) {
          product = populatedProduct;
        }
      }
      
      await elasticsearchUtils.indexProduct(product);
      return true;
    } catch (error) {
      console.error('Error syncing product to Elasticsearch:', error);
      return false;
    }
  },

  // Đồng bộ tất cả sản phẩm vào Elasticsearch
  async syncAllProductsToElasticsearch() {
    try {
      console.log('Starting bulk sync to Elasticsearch...');
      
      const products = await Product.find({ isActive: true })
        .populate('categoryId', 'name slug')
        .lean();
      
      if (products.length > 0) {
        await elasticsearchUtils.bulkIndexProducts(products);
        console.log(`✅ Successfully synced ${products.length} products to Elasticsearch`);
      }
      
      return {
        success: true,
        message: `Đã đồng bộ ${products.length} sản phẩm vào Elasticsearch`,
        count: products.length
      };
    } catch (error) {
      console.error('Error syncing all products to Elasticsearch:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đồng bộ sản phẩm vào Elasticsearch',
        error: error.message
      };
    }
  },

  // Tăng view count cho sản phẩm
  async incrementViewCount(productId) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate('categoryId', 'name slug');

      if (product) {
        // Sync to Elasticsearch
        await this.syncProductToElasticsearch(product);
      }

      return {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi cập nhật lượt xem',
        error: error.message
      };
    }
  },

  // Lấy sản phẩm theo danh mục với phân trang
  async getProductsByCategory(categoryId, options = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
        search
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Build query
      let query = {
        categoryId: categoryId,
        isActive: true
      };

      // Thêm filter giá
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Thêm tìm kiếm text
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const [products, totalProducts] = await Promise.all([
        Product.find(query)
          .populate('categoryId', 'name slug')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Product.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy danh sách sản phẩm',
        error: error.message
      };
    }
  },

  // Lấy tất cả sản phẩm với phân trang
  async getAllProducts(options = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        categoryId,
        minPrice,
        maxPrice,
        search
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Build query
      let query = { isActive: true };

      // Filter theo category
      if (categoryId) {
        query.categoryId = categoryId;
      }

      // Filter theo giá
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Tìm kiếm
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const [products, totalProducts] = await Promise.all([
        Product.find(query)
          .populate('categoryId', 'name slug')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Product.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      };
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy danh sách sản phẩm',
        error: error.message
      };
    }
  },

  // Lấy chi tiết sản phẩm
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId)
        .populate('categoryId', 'name slug')
        .lean();

      if (!product) {
        return {
          success: false,
          message: 'Không tìm thấy sản phẩm'
        };
      }

      return {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('Error in getProductById:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy thông tin sản phẩm',
        error: error.message
      };
    }
  },

  // Lấy sản phẩm liên quan
  async getRelatedProducts(productId, categoryId, limit = 6) {
    try {
      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        categoryId: categoryId,
        isActive: true
      })
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

      return {
        success: true,
        data: relatedProducts
      };
    } catch (error) {
      console.error('Error in getRelatedProducts:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy sản phẩm liên quan',
        error: error.message
      };
    }
  },

  // Lấy sản phẩm nổi bật
  async getFeaturedProducts(limit = 8) {
    try {
      const featuredProducts = await Product.find({
        isActive: true,
        rating: { $gte: 4 }
      })
        .populate('categoryId', 'name slug')
        .sort({ rating: -1, reviewCount: -1 })
        .limit(parseInt(limit))
        .lean();

      return {
        success: true,
        data: featuredProducts
      };
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy sản phẩm nổi bật',
        error: error.message
      };
    }
  }
};

module.exports = productService;
