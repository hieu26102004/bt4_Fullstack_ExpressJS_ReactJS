import React, { useState, useEffect } from 'react';
import { getUserFavoritesApi } from '../util/api';
import { useAuth } from '../components/context/auth.context';
import ProductCard from '../components/product/ProductCard';
import type { FavoriteProduct, FavoriteResponse, ApiResponse } from '../types/product.types';

const FavoritesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    }
  }, [isAuthenticated, user, currentPage]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserFavoritesApi({
        page: currentPage,
        limit: 12
      });
      const data = response.data as ApiResponse<FavoriteResponse>;
      if (data?.success) {
        setFavorites(data.data?.favorites || []);
        setPagination(data.data?.pagination);
      } else {
        setError('Không thể tải danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Có lỗi xảy ra khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page
    window.location.href = `/products/${productId}`;
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px' }}>Sản phẩm yêu thích</h1>
        <p style={{ marginBottom: '20px', color: '#6b7280' }}>
          Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px' 
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
          Sản phẩm yêu thích
        </h1>
        {pagination && (
          <span style={{ color: '#6b7280' }}>
            Tổng cộng: {pagination.totalItems} sản phẩm
          </span>
        )}
      </div>

      {loading && favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#e53e3e', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={fetchFavorites}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 0',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❤️</div>
          <h2 style={{ marginBottom: '10px', color: '#374151' }}>
            Chưa có sản phẩm yêu thích
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            Hãy thêm những sản phẩm bạn thích vào danh sách này!
          </p>
          <button
            onClick={() => window.location.href = '/products'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {favorites.map((favorite) => {
              const product = typeof favorite.productId === 'object' 
                ? favorite.productId 
                : null;
              
              if (!product) return null;

              return (
                <div key={favorite._id} style={{ position: 'relative' }}>
                  <ProductCard 
                    product={product}
                    onProductClick={handleProductClick}
                  />
                  {/* Custom remove button for favorites page */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 10
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      Đã thích: {new Date(favorite.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '10px',
              marginTop: '40px' 
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                style={{
                  padding: '10px 16px',
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3182ce',
                  color: currentPage === 1 ? '#6b7280' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Trước
              </button>
              
              <div style={{ 
                display: 'flex',
                gap: '5px',
                alignItems: 'center'
              }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <React.Fragment key={`gap-${page}`}>
                          <span style={{ color: '#6b7280' }}>...</span>
                          <button
                            onClick={() => setCurrentPage(page)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: page === currentPage ? '#3182ce' : '#f3f4f6',
                              color: page === currentPage ? 'white' : '#374151',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: page === currentPage ? '#3182ce' : '#f3f4f6',
                          color: page === currentPage ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages || loading}
                style={{
                  padding: '10px 16px',
                  backgroundColor: currentPage === pagination.totalPages ? '#e5e7eb' : '#3182ce',
                  color: currentPage === pagination.totalPages ? '#6b7280' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;