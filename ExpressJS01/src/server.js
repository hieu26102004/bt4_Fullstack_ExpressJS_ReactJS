require('dotenv').config();

// Import các nguồn cần dùng
const express = require('express'); // commonjs
const cors = require('cors'); // config cors
const apiRoutes = require('./routes/api'); // import routes
const homeController = require('./controllers/homeController');
const mongoose = require('mongoose');
const webAPI = require('./config/database');
const { elasticsearchUtils } = require('./config/elasticsearch');
const DB_TYPE = process.env.DB_TYPE || 'mongodb';

const app = express(); // cấu hình app là express
const port = process.env.PORT || 8888; // nếu không có PORT trong env thì dùng 8888

// Middleware
app.use(cors()); // config cors
app.use(express.json()); // config req.body cho json
app.use(express.urlencoded({ extended: true })); // for form data

// Routes
app.use('/api/v1', apiRoutes);
app.get('/', homeController.getHomepage);


// Kết nối database (nếu cần)
// webAPI(); // Không cần gọi nếu đã connect trong config/database.js

// Nếu dùng MySQL, sync Sequelize để tạo bảng
if (DB_TYPE === 'mysql') {
  (async () => {
    try {
      await webAPI.sync();
      console.log('Sequelize sync done (MySQL)');
    } catch (err) {
      console.error('Sequelize sync error:', err);
    }
  })();
}

// Khởi tạo Elasticsearch
(async () => {
  try {
    const isConnected = await elasticsearchUtils.checkConnection();
    if (isConnected) {
      await elasticsearchUtils.createIndexIfNotExists();
      console.log('✅ Elasticsearch initialization completed');
    } else {
      console.log('⚠️ Elasticsearch not available, will use fallback search');
    }
  } catch (error) {
    console.error('❌ Elasticsearch initialization failed:', error.message);
    console.log('⚠️ Will use fallback search instead');
  }
})();

app.listen(port, () => {
  console.log(`Backend Nodejs App listening on port ${port}`);
});