const express = require('express');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');

const { forgotPassword } = require('../controllers/forgotPasswordController');
const { verifyOTPAndResetPassword } = require('../controllers/resetPasswordController');

// Import Product và Category controllers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

// Import new controllers for enhanced features
const favoriteController = require('../controllers/favoriteController');
const viewedProductController = require('../controllers/viewedProductController');
const similarProductController = require('../controllers/similarProductController');
const productStatsController = require('../controllers/productStatsController');

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
routerAPI.get('/products/search', productController.searchProducts); // Fuzzy search
routerAPI.get('/products/search/suggestions', productController.getSearchSuggestions); // Search suggestions
routerAPI.get('/products/featured', productController.getFeaturedProducts);
routerAPI.get('/products/load-more', productController.loadMoreProducts); // Cho Lazy Loading
routerAPI.get('/products/trending', similarProductController.getTrendingProducts); // Must be before :productId route
routerAPI.get('/products/:productId', productController.getProductDetail);
routerAPI.get('/products/:productId/similar', productController.getSimilarProducts); // Similar products

// Admin/sync routes (có thể cần auth middleware)
routerAPI.post('/admin/sync/elasticsearch', productController.syncToElasticsearch);

// Product by category routes
routerAPI.get('/categories/:categoryId/products', productController.getProductsByCategory);
routerAPI.get('/category/:categorySlug/products', productController.getProductsByCategorySlug);

// ========== NEW ENHANCED FEATURES ==========

// Favorite Products routes (require authentication)
routerAPI.post('/favorites', auth, favoriteController.addToFavorites);
routerAPI.delete('/favorites/:productId', auth, favoriteController.removeFromFavorites);
routerAPI.get('/favorites', auth, favoriteController.getUserFavorites);
routerAPI.get('/favorites/check/:productId', auth, favoriteController.checkFavoriteStatus);
routerAPI.post('/favorites/toggle', auth, favoriteController.toggleFavorite);
routerAPI.get('/products/:productId/favorite-count', favoriteController.getFavoriteCount); // Public

// Viewed Products routes (require authentication)
routerAPI.post('/viewed-products', auth, viewedProductController.addViewedProduct);
routerAPI.get('/viewed-products', auth, viewedProductController.getUserViewedProducts);
routerAPI.delete('/viewed-products/:productId', auth, viewedProductController.removeViewedProduct);
routerAPI.delete('/viewed-products', auth, viewedProductController.clearUserViewedProducts);
routerAPI.get('/viewed-products/stats', auth, viewedProductController.getUserViewStats);

// Similar Products & Recommendations routes (public)
routerAPI.get('/products/:productId/similar/category', similarProductController.getSimilarProductsByCategory);
routerAPI.get('/products/:productId/similar/tags', similarProductController.getSimilarProductsByTags);
routerAPI.get('/products/:productId/similar/price', similarProductController.getSimilarProductsByPrice);
routerAPI.get('/products/:productId/recommended', similarProductController.getRecommendedProducts);
routerAPI.get('/products/:productId/similar/all', similarProductController.getAllSimilarProducts);

// Product Reviews & Statistics routes
routerAPI.post('/products/:productId/reviews', auth, productStatsController.addProductReview);
routerAPI.get('/products/:productId/reviews', productStatsController.getProductReviews); // Public
routerAPI.get('/products/:productId/stats', productStatsController.getProductStats); // Public

// Product Purchase routes (require authentication)
routerAPI.post('/purchases', auth, productStatsController.addProductPurchase);
routerAPI.put('/purchases/:purchaseId/status', auth, productStatsController.updatePurchaseStatus);

// Admin routes for review moderation (require admin role)
routerAPI.get('/admin/reviews/pending', auth, productStatsController.getPendingReviews);
routerAPI.put('/admin/reviews/:reviewId/moderate', auth, productStatsController.moderateReview);

// Wildcard route (should be last)
routerAPI.use((req, res) => {
  res.status(200).json({ message: "Hello world api" });
});

module.exports = routerAPI;