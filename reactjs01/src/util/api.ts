import axios from './axios.customize';

export const createUserApi = (name: string, email: string, password: string) => {
  const URL_API = "/api/v1/register";
  const data = { name, email, password };
  return axios.post(URL_API, data);
};

export const loginApi = (email: string, password: string) => {
  const URL_API = "/api/v1/login";
  const data = { email, password };
  return axios.post(URL_API, data);
};

export const getUserApi = () => {
  const URL_API = "/api/v1/user";
  return axios.get(URL_API);
};

export const getApiUrl = () => {
  return "/api/v1";
};

export const forgotPasswordApi = (email: string) => {
  const URL_API = "/api/v1/forgot-password";
  return axios.post(URL_API, { email });
};

export const resetPasswordApi = (email: string, otp: string, newPassword: string) => {
  const URL_API = "/api/v1/reset-password";
  return axios.post(URL_API, { email, otp, newPassword });
};

// Category APIs
export const getAllCategoriesApi = () => {
  const URL_API = "/api/v1/categories";
  return axios.get(URL_API);
};

export const getCategoryBySlugApi = (slug: string) => {
  const URL_API = `/api/v1/categories/slug/${slug}`;
  return axios.get(URL_API);
};

// Product APIs
export const getAllProductsApi = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  const URL_API = "/api/v1/products";
  return axios.get(URL_API, { params });
};

export const getProductsByCategoryApi = (categoryId: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  const URL_API = `/api/v1/categories/${categoryId}/products`;
  return axios.get(URL_API, { params });
};

export const getProductsByCategorySlugApi = (categorySlug: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  const URL_API = `/api/v1/category/${categorySlug}/products`;
  return axios.get(URL_API, { params });
};

export const getProductDetailApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}`;
  return axios.get(URL_API);
};

export const getFeaturedProductsApi = (limit?: number) => {
  const URL_API = "/api/v1/products/featured";
  return axios.get(URL_API, { params: { limit } });
};

// Lazy Loading API
export const loadMoreProductsApi = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  const URL_API = "/api/v1/products/load-more";
  return axios.get(URL_API, { params });
};

// Advanced Search APIs
export const searchProductsApi = (params?: {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  hasDiscount?: boolean;
  inStock?: boolean;
  minViewCount?: number;
  tags?: string[];
}) => {
  const URL_API = "/api/v1/products/search";
  return axios.get(URL_API, { params });
};

export const searchProductSuggestions = (query: string, limit?: number) => {
  const URL_API = "/api/v1/products/search/suggestions";
  return axios.get(URL_API, { params: { q: query, limit } });
};

export const getSimilarProductsApi = (productId: string, limit?: number) => {
  const URL_API = `/api/v1/products/${productId}/similar`;
  return axios.get(URL_API, { params: { limit } });
};

export const getProductByIdApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}`;
  return axios.get(URL_API);
};

// Admin APIs
export const syncToElasticsearchApi = () => {
  const URL_API = "/api/v1/admin/sync/elasticsearch";
  return axios.post(URL_API);
};

// ========== NEW ENHANCED FEATURES APIs ==========

// Favorite Products APIs
export const addToFavoritesApi = (productId: string) => {
  const URL_API = "/api/v1/favorites";
  return axios.post(URL_API, { productId });
};

export const removeFromFavoritesApi = (productId: string) => {
  const URL_API = `/api/v1/favorites/${productId}`;
  return axios.delete(URL_API);
};

export const getUserFavoritesApi = (params?: { page?: number; limit?: number }) => {
  const URL_API = "/api/v1/favorites";
  return axios.get(URL_API, { params });
};

export const checkFavoriteStatusApi = (productId: string) => {
  const URL_API = `/api/v1/favorites/check/${productId}`;
  return axios.get(URL_API);
};

export const toggleFavoriteApi = (productId: string) => {
  const URL_API = "/api/v1/favorites/toggle";
  return axios.post(URL_API, { productId });
};

export const getFavoriteCountApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/favorite-count`;
  return axios.get(URL_API);
};

export const getFavoriteProductsApi = (params?: {
  page?: number;
  limit?: number;
}) => {
  const URL_API = "/api/v1/favorites";
  return axios.get(URL_API, { params });
};

// Viewed Products APIs
export const addViewedProductApi = (productId: string) => {
  const URL_API = "/api/v1/viewed-products";
  return axios.post(URL_API, { productId });
};

export const getUserViewedProductsApi = (params?: { page?: number; limit?: number }) => {
  const URL_API = "/api/v1/viewed-products";
  return axios.get(URL_API, { params });
};

export const removeViewedProductApi = (productId: string) => {
  const URL_API = `/api/v1/viewed-products/${productId}`;
  return axios.delete(URL_API);
};

export const clearUserViewedProductsApi = () => {
  const URL_API = "/api/v1/viewed-products";
  return axios.delete(URL_API);
};

export const getUserViewStatsApi = () => {
  const URL_API = "/api/v1/viewed-products/stats";
  return axios.get(URL_API);
};

// Similar Products & Recommendations APIs
export const getSimilarProductsByCategoryApi = (productId: string, limit?: number) => {
  const URL_API = `/api/v1/products/${productId}/similar/category`;
  return axios.get(URL_API, { params: { limit } });
};

export const getSimilarProductsByTagsApi = (productId: string, limit?: number) => {
  const URL_API = `/api/v1/products/${productId}/similar/tags`;
  return axios.get(URL_API, { params: { limit } });
};

export const getSimilarProductsByPriceApi = (productId: string, params?: { 
  limit?: number; 
  priceRange?: number; 
}) => {
  const URL_API = `/api/v1/products/${productId}/similar/price`;
  return axios.get(URL_API, { params });
};

export const getRecommendedProductsApi = (productId: string, limit?: number) => {
  const URL_API = `/api/v1/products/${productId}/recommended`;
  return axios.get(URL_API, { params: { limit } });
};

export const getAllSimilarProductsApi = (productId: string, limit?: number) => {
  const URL_API = `/api/v1/products/${productId}/similar/all`;
  return axios.get(URL_API, { params: { limit } });
};

export const getTrendingProductsApi = (params?: { limit?: number; days?: number }) => {
  const URL_API = "/api/v1/products/trending";
  return axios.get(URL_API, { params });
};

// Product Reviews & Statistics APIs
export const addProductReviewApi = (productId: string, rating: number, comment?: string) => {
  const URL_API = `/api/v1/products/${productId}/reviews`;
  return axios.post(URL_API, { productId, rating, comment });
};

export const getProductReviewsApi = (productId: string, params?: {
  page?: number;
  limit?: number;
  onlyApproved?: boolean;
}) => {
  const URL_API = `/api/v1/products/${productId}/reviews`;
  return axios.get(URL_API, { params });
};

export const getProductStatsApi = (productId: string) => {
  const URL_API = `/api/v1/products/${productId}/stats`;
  return axios.get(URL_API);
};

// Product Purchase APIs
export const addProductPurchaseApi = (productId: string, quantity: number, price: number) => {
  const URL_API = "/api/v1/purchases";
  return axios.post(URL_API, { productId, quantity, price });
};

export const updatePurchaseStatusApi = (purchaseId: string, status: string) => {
  const URL_API = `/api/v1/purchases/${purchaseId}/status`;
  return axios.put(URL_API, { status });
};

// Admin Review Moderation APIs
export const getPendingReviewsApi = (params?: { page?: number; limit?: number }) => {
  const URL_API = "/api/v1/admin/reviews/pending";
  return axios.get(URL_API, { params });
};

export const moderateReviewApi = (reviewId: string, isApproved: boolean) => {
  const URL_API = `/api/v1/admin/reviews/${reviewId}/moderate`;
  return axios.put(URL_API, { isApproved });
};