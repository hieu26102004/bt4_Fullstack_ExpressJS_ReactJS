import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Product, ProductFilters, SearchInfo } from '../types/product.types';
import { searchProductsApi, getAllCategoriesApi } from '../util/api';
import AdvancedSearch from '../components/product/AdvancedSearch';
import ProductGrid from '../components/product/ProductGrid';
import { sortOptions } from '../types/product.types';
import '../styles/search.css';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  });
  const [categories, setCategories] = useState<any[]>([]);

  // Handler for product click
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProductFilters>(() => {
    return {
      query: searchParams.get('q') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      categoryId: searchParams.get('categoryId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      hasDiscount: searchParams.get('hasDiscount') === 'true',
      inStock: searchParams.get('inStock') !== 'false',
      minViewCount: searchParams.get('minViewCount') ? parseInt(searchParams.get('minViewCount')!) : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined
    };
  });

  // Load categories for filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategoriesApi();
        if ((response.data as any).success) {
          setCategories((response.data as any).data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Search products when filters change
  useEffect(() => {
    searchProducts();
  }, [filters]);

  const searchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchProductsApi(filters);
      
      if ((response.data as any).success) {
        setProducts((response.data as any).data.products);
        setPagination((response.data as any).data.pagination);
        setSearchInfo((response.data as any).data.searchInfo);
      } else {
        setError((response.data as any).message || 'Có lỗi xảy ra khi tìm kiếm');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Có lỗi xảy ra khi tìm kiếm sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = sortOptions.find(option => option.value === e.target.value);
    if (selectedOption) {
      handleFiltersChange({
        ...filters,
        sortBy: selectedOption.sortBy as any,
        sortOrder: selectedOption.sortOrder,
        page: 1
      });
    }
  };

  const handlePageChange = (page: number) => {
    handleFiltersChange({
      ...filters,
      page
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (categoryId: string) => {
    handleFiltersChange({
      ...filters,
      categoryId: categoryId || undefined,
      page: 1
    });
  };

  const getCurrentSortValue = () => {
    const currentSort = sortOptions.find(
      option => option.sortBy === filters.sortBy && option.sortOrder === filters.sortOrder
    );
    return currentSort?.value || 'newest';
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Page Intro */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: 'white'
          }}>
            🔍 Tìm kiếm sản phẩm
          </h1>
          <p style={{ 
            fontSize: '18px', 
            margin: '0',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Sử dụng bộ lọc thông minh để tìm sản phẩm phù hợp nhất với bạn
          </p>
        </div>
        
        {/* Search Info */}
        {searchInfo && (
          <div className="search-info">
            <p>
              {searchInfo.query ? (
                <>
                  Tìm thấy <strong>{searchInfo.totalHits}</strong> sản phẩm cho từ khóa "{searchInfo.query}"
                  {searchInfo.usingFallback && (
                    <span className="fallback-notice"> (sử dụng tìm kiếm cơ bản)</span>
                  )}
                </>
              ) : (
                <>Hiển thị <strong>{searchInfo.totalHits}</strong> sản phẩm</>
              )}
            </p>
          </div>
        )}

        <div className="search-layout">
          {/* Sidebar Filters */}
          <div className="search-sidebar">
            <AdvancedSearch
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={searchProducts}
              isSearching={isLoading}
            />

            {/* Category Filter */}
            <div className="category-filter">
              <h3>Danh mục</h3>
              <div className="category-list">
                <button
                  className={`category-item ${!filters.categoryId ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter('')}
                >
                  Tất cả danh mục
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    className={`category-item ${filters.categoryId === category._id ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(category._id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="search-content">
            {/* Sort and Results Info */}
            <div className="search-toolbar">
              <div className="results-info">
                {pagination.totalProducts > 0 && (
                  <span>
                    Hiển thị {((pagination.currentPage - 1) * pagination.limit) + 1}-
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)} 
                    trong tổng số {pagination.totalProducts} sản phẩm
                  </span>
                )}
              </div>
              
              <div className="sort-controls">
                <label htmlFor="sort">Sắp xếp theo:</label>
                <select
                  id="sort"
                  value={getCurrentSortValue()}
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tìm kiếm sản phẩm...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={searchProducts} className="retry-button">
                  Thử lại
                </button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && products.length === 0 && (
              <div className="no-results">
                <h3>Không tìm thấy sản phẩm nào</h3>
                <p>Hãy thử:</p>
                <ul>
                  <li>Kiểm tra lại từ khóa tìm kiếm</li>
                  <li>Sử dụng từ khóa tổng quát hơn</li>
                  <li>Thay đổi hoặc xóa bộ lọc</li>
                </ul>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && products.length > 0 && (
              <>
                <ProductGrid 
                  initialProducts={products}
                  useLazyLoading={false}
                  useInfiniteScroll={false}
                  onProductClick={handleProductClick}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="pagination-button"
                    >
                      « Trước
                    </button>

                    <div className="pagination-numbers">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`pagination-number ${
                              pageNum === pagination.currentPage ? 'active' : ''
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="pagination-button"
                    >
                      Sau »
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
