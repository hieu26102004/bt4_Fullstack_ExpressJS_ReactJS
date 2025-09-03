import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductFilters from '../components/product/ProductFilters';
import type { Product, ProductFilters as IProductFilters } from '../types/product.types';
import { getAllProductsApi } from '../util/api';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Parse filters from URL
  const getFiltersFromUrl = (): IProductFilters => {
    return {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      categoryId: searchParams.get('categoryId') || undefined,
      categorySlug: searchParams.get('categorySlug') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      search: searchParams.get('search') || undefined,
    };
  };

  const [filters, setFilters] = useState<IProductFilters>(getFiltersFromUrl());

  // Update URL when filters change
  const updateUrlParams = (newFilters: IProductFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  // Fetch products
  const fetchProducts = async (currentFilters: IProductFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllProductsApi({
        ...currentFilters,
        page: 1 // Always start from page 1 for initial load
      });

      const result = response.data as any;
      
      if (result?.success) {
        setProducts(result.data?.products || []);
        setTotalProducts(result.data?.pagination?.totalProducts || 0);
      } else {
        setError('Không thể tải danh sách sản phẩm');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Có lỗi xảy ra khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: IProductFilters) => {
    const updatedFilters = { ...newFilters, page: 1 }; // Reset to page 1
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string | null) => {
    const newFilters = {
      ...filters,
      categoryId: categoryId || undefined,
      page: 1
    };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  // Handle product click
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Load initial data
  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  // Update filters when URL changes
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
  }, [searchParams]);

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>Sản phẩm</h1>
          <p>Khám phá bộ sưu tập sản phẩm đa dạng của chúng tôi</p>
        </div>

        <div className="products-layout">
          {/* Sidebar */}
          <aside className="products-sidebar">
            <CategoryFilter
              selectedCategoryId={filters.categoryId}
              onCategoryChange={handleCategoryChange}
            />
            
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalProducts={totalProducts}
            />
          </aside>

          {/* Main Content */}
          <main className="products-main">
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Đang tải sản phẩm...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-container">
                <p>{error}</p>
                <button 
                  onClick={() => fetchProducts(filters)}
                  className="retry-btn"
                >
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && (
              <ProductGrid
                initialProducts={products}
                filters={filters}
                useLazyLoading={true}
                useInfiniteScroll={true}
                onProductClick={handleProductClick}
                onLoadStart={() => console.log('Started loading more products')}
                onLoadEnd={() => console.log('Finished loading more products')}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
