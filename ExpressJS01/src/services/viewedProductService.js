const ViewedProduct = require('../models/viewedProduct');
const Product = require('../models/product');
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

class ViewedProductService {
  // Thêm hoặc cập nhật sản phẩm đã xem
  async addViewedProduct(userId, productId) {
    try {
      if (DB_TYPE === 'mongodb') {
        // Tìm xem user đã view sản phẩm này trong vòng 1 ngày chưa
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const existingView = await ViewedProduct.findOne({
          userId: userId,
          productId: productId,
          lastViewedAt: { $gte: oneDayAgo }
        });

        let shouldIncreaseProductView = false;

        if (existingView) {
          // Đã xem trong vòng 1 ngày, chỉ cập nhật lastViewedAt
          existingView.lastViewedAt = new Date();
          await existingView.save();
        } else {
          // Chưa xem trong vòng 1 ngày, tăng view count
          shouldIncreaseProductView = true;
          
          const viewedProduct = await ViewedProduct.findOneAndUpdate(
            { userId: userId, productId: productId },
            { 
              $inc: { viewCount: 1 },
              $set: { lastViewedAt: new Date() }
            },
            { 
              upsert: true, 
              new: true,
              setDefaultsOnInsert: true 
            }
          );
        }

        // Chỉ cập nhật viewCount trong Product nếu là view mới
        if (shouldIncreaseProductView) {
          await Product.findByIdAndUpdate(productId, {
            $inc: { viewCount: 1 }
          });
        }

        return { success: true, newView: shouldIncreaseProductView };
      } else {
        // MySQL/Sequelize - Similar logic for MySQL
        const { Op } = require('sequelize');
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Check if user viewed this product in the last day
        const existingView = await ViewedProduct.findOne({
          where: {
            userId: userId,
            productId: productId,
            lastViewedAt: { [Op.gte]: oneDayAgo }
          }
        });

        let shouldIncreaseProductView = false;

        if (existingView) {
          // Already viewed within 1 day, just update lastViewedAt
          await existingView.update({ lastViewedAt: new Date() });
        } else {
          // New view within the day, increase count
          shouldIncreaseProductView = true;
          
          const [viewedProduct, created] = await ViewedProduct.findOrCreate({
            where: { userId: userId, productId: productId },
            defaults: {
              userId: userId,
              productId: productId,
              viewCount: 1,
              lastViewedAt: new Date()
            }
          });

          if (!created) {
            await viewedProduct.update({
              viewCount: viewedProduct.viewCount + 1,
              lastViewedAt: new Date()
            });
          }
        }

        // Only update Product viewCount if it's a new view
        if (shouldIncreaseProductView) {
          await Product.increment('viewCount', { where: { id: productId } });
        }

        return { success: true, newView: shouldIncreaseProductView };
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách sản phẩm đã xem của user
  async getUserViewedProducts(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      if (DB_TYPE === 'mongodb') {
        const viewedProducts = await ViewedProduct.find({ userId: userId })
          .populate('productId')
          .sort({ lastViewedAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await ViewedProduct.countDocuments({ userId: userId });

        return {
          viewedProducts: viewedProducts.filter(viewed => viewed.productId), // Lọc bỏ sản phẩm đã bị xóa
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        };
      } else {
        const { rows: viewedProducts, count: total } = await ViewedProduct.findAndCountAll({
          where: { userId: userId },
          include: [Product],
          order: [['lastViewedAt', 'DESC']],
          offset: skip,
          limit: limit
        });

        return {
          viewedProducts,
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

  // Xóa sản phẩm khỏi danh sách đã xem
  async removeViewedProduct(userId, productId) {
    try {
      const result = await ViewedProduct.findOneAndDelete({
        userId: userId,
        productId: productId
      });

      if (!result) {
        throw new Error('Viewed product not found');
      }

      return { message: 'Product removed from viewed list' };
    } catch (error) {
      throw error;
    }
  }

  // Xóa tất cả sản phẩm đã xem của user
  async clearUserViewedProducts(userId) {
    try {
      if (DB_TYPE === 'mongodb') {
        const result = await ViewedProduct.deleteMany({ userId: userId });
        return { message: `Cleared ${result.deletedCount} viewed products` };
      } else {
        const result = await ViewedProduct.destroy({ where: { userId: userId } });
        return { message: `Cleared ${result} viewed products` };
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê xem sản phẩm của user
  async getUserViewStats(userId) {
    try {
      if (DB_TYPE === 'mongodb') {
        const stats = await ViewedProduct.aggregate([
          { $match: { userId: mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalViews: { $sum: '$viewCount' },
              uniqueProducts: { $sum: 1 },
              lastViewed: { $max: '$lastViewedAt' }
            }
          }
        ]);

        return stats[0] || { totalViews: 0, uniqueProducts: 0, lastViewed: null };
      } else {
        const stats = await ViewedProduct.findAll({
          where: { userId: userId },
          attributes: [
            [ViewedProduct.sequelize.fn('SUM', ViewedProduct.sequelize.col('viewCount')), 'totalViews'],
            [ViewedProduct.sequelize.fn('COUNT', ViewedProduct.sequelize.col('id')), 'uniqueProducts'],
            [ViewedProduct.sequelize.fn('MAX', ViewedProduct.sequelize.col('lastViewedAt')), 'lastViewed']
          ],
          raw: true
        });

        return stats[0] || { totalViews: 0, uniqueProducts: 0, lastViewed: null };
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ViewedProductService();