const Product = require('../models/product');
const ViewedProduct = require('../models/viewedProduct');
const FavoriteProduct = require('../models/favoriteProduct');
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

class SimilarProductService {
  // Lấy sản phẩm tương tự dựa trên category
  async getSimilarProductsByCategory(productId, limit = 6) {
    try {
      if (DB_TYPE === 'mongodb') {
        // Lấy thông tin sản phẩm hiện tại
        const currentProduct = await Product.findById(productId);
        if (!currentProduct) {
          throw new Error('Product not found');
        }

        // Tìm sản phẩm cùng category, khác productId
        const similarProducts = await Product.find({
          categoryId: currentProduct.categoryId,
          _id: { $ne: productId },
          isActive: true
        })
        .populate('categoryId')
        .sort({ viewCount: -1, rating: -1, createdAt: -1 })
        .limit(limit);

        return similarProducts;
      } else {
        // MySQL/Sequelize
        const currentProduct = await Product.findByPk(productId);
        if (!currentProduct) {
          throw new Error('Product not found');
        }

        const similarProducts = await Product.findAll({
          where: {
            categoryId: currentProduct.categoryId,
            id: { [Product.sequelize.Sequelize.Op.ne]: productId },
            isActive: true
          },
          order: [
            ['viewCount', 'DESC'],
            ['rating', 'DESC'],
            ['createdAt', 'DESC']
          ],
          limit: limit
        });

        return similarProducts;
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm tương tự dựa trên tags
  async getSimilarProductsByTags(productId, limit = 6) {
    try {
      if (DB_TYPE === 'mongodb') {
        const currentProduct = await Product.findById(productId);
        if (!currentProduct || !currentProduct.tags || currentProduct.tags.length === 0) {
          return [];
        }

        // Tìm sản phẩm có chung tags
        const similarProducts = await Product.find({
          _id: { $ne: productId },
          tags: { $in: currentProduct.tags },
          isActive: true
        })
        .populate('categoryId')
        .sort({ viewCount: -1, rating: -1 })
        .limit(limit);

        return similarProducts;
      } else {
        const currentProduct = await Product.findByPk(productId);
        if (!currentProduct || !currentProduct.tags || currentProduct.tags.length === 0) {
          return [];
        }

        // MySQL JSON contains
        const similarProducts = await Product.findAll({
          where: {
            id: { [Product.sequelize.Sequelize.Op.ne]: productId },
            tags: { [Product.sequelize.Sequelize.Op.overlap]: currentProduct.tags },
            isActive: true
          },
          order: [
            ['viewCount', 'DESC'],
            ['rating', 'DESC']
          ],
          limit: limit
        });

        return similarProducts;
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm tương tự dựa trên khoảng giá
  async getSimilarProductsByPriceRange(productId, priceRangePercent = 30, limit = 6) {
    try {
      if (DB_TYPE === 'mongodb') {
        const currentProduct = await Product.findById(productId);
        if (!currentProduct) {
          throw new Error('Product not found');
        }

        const minPrice = currentProduct.price * (1 - priceRangePercent / 100);
        const maxPrice = currentProduct.price * (1 + priceRangePercent / 100);

        const similarProducts = await Product.find({
          _id: { $ne: productId },
          price: { $gte: minPrice, $lte: maxPrice },
          isActive: true
        })
        .populate('categoryId')
        .sort({ rating: -1, viewCount: -1 })
        .limit(limit);

        return similarProducts;
      } else {
        const currentProduct = await Product.findByPk(productId);
        if (!currentProduct) {
          throw new Error('Product not found');
        }

        const minPrice = currentProduct.price * (1 - priceRangePercent / 100);
        const maxPrice = currentProduct.price * (1 + priceRangePercent / 100);

        const similarProducts = await Product.findAll({
          where: {
            id: { [Product.sequelize.Sequelize.Op.ne]: productId },
            price: { 
              [Product.sequelize.Sequelize.Op.between]: [minPrice, maxPrice] 
            },
            isActive: true
          },
          order: [
            ['rating', 'DESC'],
            ['viewCount', 'DESC']
          ],
          limit: limit
        });

        return similarProducts;
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm đề xuất thông minh (kết hợp nhiều yếu tố)
  async getRecommendedProducts(productId, userId = null, limit = 6) {
    try {
      const similarByCategory = await this.getSimilarProductsByCategory(productId, limit);
      const similarByTags = await this.getSimilarProductsByTags(productId, limit);
      const similarByPrice = await this.getSimilarProductsByPriceRange(productId, 30, limit);

      // Kết hợp và loại bỏ trùng lặp
      const allSimilar = [...similarByCategory, ...similarByTags, ...similarByPrice];
      const uniqueProducts = [];
      const seenIds = new Set();

      for (const product of allSimilar) {
        const id = product._id || product.id;
        if (!seenIds.has(id.toString())) {
          seenIds.add(id.toString());
          uniqueProducts.push(product);
        }
      }

      // Nếu có userId, ưu tiên sản phẩm chưa xem hoặc chưa yêu thích
      if (userId) {
        const viewedProducts = await ViewedProduct.find({ userId }).select('productId');
        const favoriteProducts = await FavoriteProduct.find({ userId }).select('productId');
        
        const viewedIds = new Set(viewedProducts.map(v => v.productId.toString()));
        const favoriteIds = new Set(favoriteProducts.map(f => f.productId.toString()));

        // Sắp xếp: chưa xem > chưa yêu thích > đã xem/yêu thích
        uniqueProducts.sort((a, b) => {
          const aId = (a._id || a.id).toString();
          const bId = (b._id || b.id).toString();
          
          const aViewed = viewedIds.has(aId);
          const bViewed = viewedIds.has(bId);
          const aFavorite = favoriteIds.has(aId);
          const bFavorite = favoriteIds.has(bId);
          
          if (!aViewed && bViewed) return -1;
          if (aViewed && !bViewed) return 1;
          if (!aFavorite && bFavorite) return -1;
          if (aFavorite && !bFavorite) return 1;
          
          return 0;
        });
      }

      return uniqueProducts.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm xu hướng (dựa trên views và purchases gần đây)
  async getTrendingProducts(limit = 10, days = 7) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      if (DB_TYPE === 'mongodb') {
        const trendingProducts = await Product.find({
          isActive: true,
          updatedAt: { $gte: dateFrom }
        })
        .populate('categoryId')
        .sort({ 
          viewCount: -1, 
          favoriteCount: -1, 
          purchaseCount: -1, 
          rating: -1 
        })
        .limit(limit);

        return trendingProducts;
      } else {
        const trendingProducts = await Product.findAll({
          where: {
            isActive: true,
            updatedAt: { [Product.sequelize.Sequelize.Op.gte]: dateFrom }
          },
          order: [
            ['viewCount', 'DESC'],
            ['favoriteCount', 'DESC'],
            ['purchaseCount', 'DESC'],
            ['rating', 'DESC']
          ],
          limit: limit
        });

        return trendingProducts;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SimilarProductService();