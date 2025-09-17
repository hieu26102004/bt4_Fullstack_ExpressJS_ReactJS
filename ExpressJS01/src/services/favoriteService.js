const FavoriteProduct = require('../models/favoriteProduct');
const Product = require('../models/product');
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

class FavoriteService {
  // Thêm sản phẩm vào danh sách yêu thích
  async addToFavorites(userId, productId) {
    try {
      // Kiểm tra xem sản phẩm đã được yêu thích chưa
      const existingFavorite = await FavoriteProduct.findOne({
        userId: userId,
        productId: productId
      });

      if (existingFavorite) {
        throw new Error('Product is already in favorites');
      }

      // Tạo favorite mới
      const favorite = new FavoriteProduct({
        userId: userId,
        productId: productId
      });

      await favorite.save();

      // Cập nhật favoriteCount trong Product
      if (DB_TYPE === 'mongodb') {
        await Product.findByIdAndUpdate(productId, {
          $inc: { favoriteCount: 1 }
        });
      } else {
        await Product.increment('favoriteCount', { where: { id: productId } });
      }

      return favorite;
    } catch (error) {
      throw error;
    }
  }

  // Xóa sản phẩm khỏi danh sách yêu thích
  async removeFromFavorites(userId, productId) {
    try {
      const favorite = await FavoriteProduct.findOneAndDelete({
        userId: userId,
        productId: productId
      });

      if (!favorite) {
        throw new Error('Product not found in favorites');
      }

      // Giảm favoriteCount trong Product
      if (DB_TYPE === 'mongodb') {
        await Product.findByIdAndUpdate(productId, {
          $inc: { favoriteCount: -1 }
        });
      } else {
        await Product.decrement('favoriteCount', { where: { id: productId } });
      }

      return { message: 'Product removed from favorites' };
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách sản phẩm yêu thích của user
  async getUserFavorites(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      if (DB_TYPE === 'mongodb') {
        const favorites = await FavoriteProduct.find({ userId: userId })
          .populate('productId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await FavoriteProduct.countDocuments({ userId: userId });

        return {
          favorites: favorites.filter(fav => fav.productId), // Lọc bỏ sản phẩm đã bị xóa
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        };
      } else {
        const { rows: favorites, count: total } = await FavoriteProduct.findAndCountAll({
          where: { userId: userId },
          include: [Product],
          order: [['createdAt', 'DESC']],
          offset: skip,
          limit: limit
        });

        return {
          favorites,
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

  // Kiểm tra xem sản phẩm có được yêu thích bởi user không
  async isFavorite(userId, productId) {
    try {
      const favorite = await FavoriteProduct.findOne({
        userId: userId,
        productId: productId
      });

      return !!favorite;
    } catch (error) {
      throw error;
    }
  }

  // Lấy số lượng favorites của một sản phẩm
  async getFavoriteCount(productId) {
    try {
      const count = await FavoriteProduct.countDocuments({ productId: productId });
      return count;
    } catch (error) {
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId, productId) {
    try {
      const existingFavorite = await FavoriteProduct.findOne({
        userId: userId,
        productId: productId
      });

      if (existingFavorite) {
        return await this.removeFromFavorites(userId, productId);
      } else {
        return await this.addToFavorites(userId, productId);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FavoriteService();