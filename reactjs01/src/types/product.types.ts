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
  createdAt: string;
  updatedAt: string;
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
  sortBy?: 'createdAt' | 'price' | 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
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
];
