import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import type { Product, ProductFilters as IProductFilters, Category } from '../types/product.types';
import { getProductsByCategorySlugApi, getCategoryBySlugApi } from '../util/api';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
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

  // Fetch category and products
  const fetchCategoryData = async (slug: string, currentFilters: IProductFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category info
      const categoryResponse = await getCategoryBySlugApi(slug);
      const categoryResult = categoryResponse.data as any;
      
      if (!categoryResult?.success) {
        setError('Không tìm thấy danh mục');
        return;
      }

      setCategory(categoryResult.data);

      // Fetch products
      const productsResponse = await getProductsByCategorySlugApi(slug, {
        ...currentFilters,
        page: 1
      });

      const productsResult = productsResponse.data as any;
      
      if (productsResult?.success) {
        setProducts(productsResult.data?.products || []);
        setTotalProducts(productsResult.data?.pagination?.totalProducts || 0);
      } else {
        setError('Không thể tải danh sách sản phẩm');
      }
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: IProductFilters) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);
  };

  // Load data when slug or filters change
  useEffect(() => {
    if (categorySlug) {
      fetchCategoryData(categorySlug, filters);
    }
  }, [categorySlug, filters]);

  // Update filters when URL changes
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Đang tải danh mục...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="error-container">
            <h2>Không tìm thấy danh mục</h2>
            <p>{error || 'Danh mục không tồn tại hoặc đã bị xóa'}</p>
            <a href="/products" className="retry-btn">
              Xem tất cả sản phẩm
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        {/* Category Header */}
        <div className="category-header">
          <div className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span> / </span>
            <a href="/products">Sản phẩm</a>
            <span> / </span>
            <span>{category.name}</span>
          </div>
          
          <h1>{category.name}</h1>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
          
          <div className="category-stats">
            <span>{totalProducts} sản phẩm</span>
          </div>
        </div>

        <div className="category-layout">
          {/* Sidebar */}
          <aside className="category-sidebar">
            <ProductFilters
              filters={{ ...filters, categorySlug }}
              onFiltersChange={handleFiltersChange}
              totalProducts={totalProducts}
            />
          </aside>

          {/* Main Content */}
          <main className="category-main">
            <ProductGrid
              initialProducts={products}
              filters={{ ...filters, categorySlug }}
              useLazyLoading={true}
              useInfiniteScroll={true}
              onProductClick={(productId) => {
                // Navigate to product detail
                window.location.href = `/products/${productId}`;
              }}
              onLoadStart={() => console.log('Loading more products...')}
              onLoadEnd={() => console.log('Finished loading products')}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
