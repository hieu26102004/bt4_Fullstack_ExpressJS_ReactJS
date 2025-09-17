// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId: Category | string;
  images: string[];
  stock: number;
  isActive: boolean;
  slug: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  viewCount?: number;
  purchaseCount?: number;
  favoriteCount?: number;
  createdAt: string;
  updatedAt: string;
  _score?: number; // For search relevance
  highlight?: any; // For search highlights
}

// Pagination Types
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  category?: Category;
}

export interface LazyLoadResponse {
  products: Product[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

// Filter Types
export interface ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'name' | 'rating' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
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
  search?: string;
  query?: string; // For fuzzy search
}

// Sort Options
export interface SortOption {
  label: string;
  value: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const sortOptions: SortOption[] = [
  { label: 'Mới nhất', value: 'newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Cũ nhất', value: 'oldest', sortBy: 'createdAt', sortOrder: 'asc' },
  { label: 'Giá thấp đến cao', value: 'price-asc', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Giá cao đến thấp', value: 'price-desc', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Tên A-Z', value: 'name-asc', sortBy: 'name', sortOrder: 'asc' },
  { label: 'Tên Z-A', value: 'name-desc', sortBy: 'name', sortOrder: 'desc' },
  { label: 'Đánh giá cao nhất', value: 'rating-desc', sortBy: 'rating', sortOrder: 'desc' },
  { label: 'Xem nhiều nhất', value: 'view-desc', sortBy: 'viewCount', sortOrder: 'desc' },
  { label: 'Liên quan nhất', value: 'relevance', sortBy: 'createdAt', sortOrder: 'desc' }, // For search
];

// Search suggestion types
export interface SearchSuggestion {
  text: string;
  _source: {
    name: string;
    price: number;
    images: string[];
  };
}

export interface SearchInfo {
  query: string;
  totalHits: number;
  maxScore?: number;
  usingFallback?: boolean;
}

// ========== NEW ENHANCED FEATURE TYPES ==========

// Favorite Product Types
export interface FavoriteProduct {
  _id: string;
  userId: string;
  productId: Product | string;
  createdAt: string;
}

export interface FavoriteResponse {
  favorites: FavoriteProduct[];
  pagination: Pagination;
}

// Viewed Product Types
export interface ViewedProduct {
  _id: string;
  userId: string;
  productId: Product | string;
  viewCount: number;
  lastViewedAt: string;
  createdAt: string;
}

export interface ViewedProductResponse {
  viewedProducts: ViewedProduct[];
  pagination: Pagination;
}

export interface ViewStats {
  totalViews: number;
  uniqueProducts: number;
  lastViewed: string | null;
}

// Product Review Types
export interface ProductReview {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  reviews: ProductReview[];
  pagination: Pagination;
}

export interface AddReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
}

// Product Purchase Types
export interface ProductPurchase {
  _id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  totalAmount: number;
  orderStatus: 'pending' | 'completed' | 'cancelled' | 'refunded';
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  productId: string;
  quantity: number;
  price: number;
}

// Product Statistics Types
export interface ProductStats {
  productInfo: {
    viewCount: number;
    favoriteCount: number;
    purchaseCount: number;
    rating: number;
    reviewCount: number;
  };
  purchaseStats: Array<{
    _id: string;
    count: number;
    totalQuantity: number;
    totalAmount: number;
  }>;
  ratingStats: Array<{
    _id: number;
    count: number;
  }>;
}

// Similar Products Types
export interface SimilarProductsResponse {
  byCategory: Product[];
  byTags: Product[];
  byPrice: Product[];
  recommended: Product[];
}

// API Request/Response Types for new features
export interface ToggleFavoriteRequest {
  productId: string;
}

export interface AddViewedProductRequest {
  productId: string;
}

export interface FavoriteStatusResponse {
  isFavorite: boolean;
}

export interface FavoriteCountResponse {
  favoriteCount: number;
}
