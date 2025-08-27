require('dotenv').config();

// Import các nguồn cần dùng
const express = require('express'); // commonjs
const cors = require('cors'); // config cors
const apiRoutes = require('./routes/api'); // import routes
const homeController = require('./controllers/homeController');
const mongoose = require('mongoose');
const webAPI = require('./config/database');

const app = express(); // cấu hình app là express
const port = process.env.PORT || 8888; // nếu không có PORT trong env thì dùng 8888

// Middleware
app.use(cors()); // config cors
app.use(express.json()); // config req.body cho json
app.use(express.urlencoded({ extended: true })); // for form data

// Routes
app.use('/api/v1', apiRoutes);
app.get('/', homeController.getHomepage);

// Kết nối database
webAPI();

app.listen(port, () => {
  (async () => {
    try {
  // await mongoose.connect(webAPI.connection()); // redundant, already connected
      console.log(`Backend Nodejs App listening on port ${port}`);
    } catch (error) {
      console.error('=> Error connect to DB: ', error);
    }
  })();
});