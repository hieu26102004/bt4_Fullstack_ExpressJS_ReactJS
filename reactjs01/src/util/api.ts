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

// Admin APIs
export const syncToElasticsearchApi = () => {
  const URL_API = "/api/v1/admin/sync/elasticsearch";
  return axios.post(URL_API);
};