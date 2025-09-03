import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from './ProductCard';
import type { Product, ProductFilters, LazyLoadResponse } from '../../types/product.types';
import { loadMoreProductsApi } from '../../util/api';

interface ProductGridProps {
  initialProducts?: Product[];
  filters?: ProductFilters;
  useLazyLoading?: boolean;
  useInfiniteScroll?: boolean;
  onProductClick?: (productId: string) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  initialProducts = [],
  filters = {},
  useLazyLoading = true,
  useInfiniteScroll = true,
  onProductClick,
  onLoadStart,
  onLoadEnd
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Ref cho infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreElementRef = useRef<HTMLDivElement | null>(null);

  // Reset khi filters thay đổi
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
  }, [initialProducts, filters]);

  // Hàm load thêm sản phẩm
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    onLoadStart?.();

    try {
      const params = {
        ...filters,
        page: currentPage + 1,
        limit: filters.limit || 12
      };

      const response = await loadMoreProductsApi(params);
      const result = response.data as LazyLoadResponse;

      if (result.products && result.products.length > 0) {
        setProducts(prev => [...prev, ...result.products]);
        setCurrentPage(result.currentPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
      setError('Có lỗi xảy ra khi tải thêm sản phẩm');
    } finally {
      setLoading(false);
      onLoadEnd?.();
    }
  }, [loading, hasMore, currentPage, filters, onLoadStart, onLoadEnd]);

  // Setup Intersection Observer cho infinite scroll
  useEffect(() => {
    if (!useInfiniteScroll || !useLazyLoading) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMoreProducts();
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    const currentElement = loadMoreElementRef.current;
    if (currentElement) {
      observerRef.current.observe(currentElement);
    }

    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
      }
    };
  }, [useInfiniteScroll, useLazyLoading, hasMore, loading, loadMoreProducts]);

  // Handle manual load more button
  const handleLoadMoreClick = () => {
    if (!loading && hasMore) {
      loadMoreProducts();
    }
  };

  return (
    <div className="product-grid-container">
      {/* Products Grid */}
      <div className="product-grid">
        {products.map((product, index) => (
          <ProductCard 
            key={`${product._id}-${index}`} 
            product={product} 
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {/* Loading States */}
      {products.length === 0 && !loading && (
        <div className="empty-state">
          <p>Không có sản phẩm nào được tìm thấy</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={handleLoadMoreClick} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {/* Lazy Loading Controls */}
      {useLazyLoading && (
        <>
          {/* Infinite Scroll Trigger */}
          {useInfiniteScroll && hasMore && (
            <div 
              ref={loadMoreElementRef} 
              className="infinite-scroll-trigger"
              style={{ height: '20px', margin: '20px 0' }}
            />
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Đang tải thêm sản phẩm...</p>
              </div>
            </div>
          )}

          {/* Manual Load More Button */}
          {!useInfiniteScroll && hasMore && !loading && (
            <div className="load-more-container">
              <button 
                onClick={handleLoadMoreClick}
                className="load-more-btn"
              >
                Tải thêm sản phẩm
              </button>
            </div>
          )}

          {/* End of Products */}
          {!hasMore && products.length > 0 && (
            <div className="end-of-products">
              <p>Đã hiển thị tất cả sản phẩm</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
