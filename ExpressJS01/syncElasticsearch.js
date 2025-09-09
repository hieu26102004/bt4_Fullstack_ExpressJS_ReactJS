require('dotenv').config();
const mongoose = require('mongoose');
const { elasticsearchUtils } = require('./src/config/elasticsearch');
const productService = require('./src/services/productService');

async function syncDataToElasticsearch() {
  try {
    console.log('🚀 Starting Elasticsearch sync process...');

    // Kết nối MongoDB
    if (process.env.DB_TYPE === 'mongodb') {
      await mongoose.connect(process.env.MONGO_DB_URL || 'mongodb://localhost:27017/express01');
      console.log('✅ Connected to MongoDB');
    }

    // Kiểm tra kết nối Elasticsearch
    const isConnected = await elasticsearchUtils.checkConnection();
    if (!isConnected) {
      console.error('❌ Cannot connect to Elasticsearch. Please make sure Elasticsearch is running.');
      process.exit(1);
    }

    // Tạo index nếu chưa tồn tại
    await elasticsearchUtils.createIndexIfNotExists();

    // Đồng bộ tất cả sản phẩm
    const result = await productService.syncAllProductsToElasticsearch();
    
    if (result.success) {
      console.log('✅ Sync completed successfully!');
      console.log(`📊 Synced ${result.count} products to Elasticsearch`);
    } else {
      console.error('❌ Sync failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Error during sync:', error);
  } finally {
    // Đóng kết nối
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Chạy script
if (require.main === module) {
  syncDataToElasticsearch();
}

module.exports = { syncDataToElasticsearch };
