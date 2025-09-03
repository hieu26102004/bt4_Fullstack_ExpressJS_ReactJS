const express = require('express');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');

const { forgotPassword } = require('../controllers/forgotPasswordController');
const { verifyOTPAndResetPassword } = require('../controllers/resetPasswordController');

// Import Product và Category controllers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

const routerAPI = express.Router();


// Auth routes
routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

// Quên mật khẩu
routerAPI.post('/forgot-password', forgotPassword);
routerAPI.post('/reset-password', verifyOTPAndResetPassword);

// Protected routes
routerAPI.get('/user', auth, getUser);
routerAPI.get('/account', auth, delay, getAccount);

// Category routes
routerAPI.get('/categories', categoryController.getAllCategories);
routerAPI.get('/categories/:categoryId', categoryController.getCategoryById);
routerAPI.get('/categories/slug/:slug', categoryController.getCategoryBySlug);

// Product routes
routerAPI.get('/products', productController.getAllProducts);
routerAPI.get('/products/featured', productController.getFeaturedProducts);
routerAPI.get('/products/load-more', productController.loadMoreProducts); // Cho Lazy Loading
routerAPI.get('/products/:productId', productController.getProductDetail);

// Product by category routes
routerAPI.get('/categories/:categoryId/products', productController.getProductsByCategory);
routerAPI.get('/category/:categorySlug/products', productController.getProductsByCategorySlug);

// Wildcard route (should be last)
routerAPI.use((req, res) => {
  res.status(200).json({ message: "Hello world api" });
});

module.exports = routerAPI;