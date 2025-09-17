import React, { useState, useEffect } from 'react';
import { getUserViewedProductsApi, clearUserViewedProductsApi, getUserViewStatsApi } from '../util/api';
import { useAuth } from '../components/context/auth.context';
import ProductCard from '../components/product/ProductCard';
import type { ViewedProduct, ViewedProductResponse, ViewStats, ApiResponse } from '../types/product.types';

const ViewedProductsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchViewedProducts();
      fetchViewStats();
    }
  }, [isAuthenticated, user, currentPage]);

  const fetchViewedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserViewedProductsApi({
        page: currentPage,
        limit: 12
      });
      const data = response.data as ApiResponse<ViewedProductResponse>;
      if (data?.success) {
        setViewedProducts(data.data?.viewedProducts || []);
        setPagination(data.data?.pagination);
      } else {
        setError('Không thể tải danh sách đã xem');
      }
    } catch (error) {
      console.error('Error fetching viewed products:', error);
      setError('Có lỗi xảy ra khi tải danh sách đã xem');
    } finally {
      setLoading(false);
    }
  };

  const fetchViewStats = async () => {
    try {
      const response = await getUserViewStatsApi();
      const data = response.data as ApiResponse<ViewStats>;
      if (data?.success) {
        setStats(data.data || null);
      }
    } catch (error) {
      console.error('Error fetching view stats:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử xem sản phẩm?')) {
      return;
    }

    setClearing(true);
    try {
      const response = await clearUserViewedProductsApi();
      const data = response.data as ApiResponse<any>;
      if (data?.success) {
        setViewedProducts([]);
        setPagination(null);
        setStats(null);
        alert('Đã xóa tất cả lịch sử xem sản phẩm');
      }
    } catch (error) {
      console.error('Error clearing viewed products:', error);
      alert('Có lỗi xảy ra khi xóa lịch sử');
    } finally {
      setClearing(false);
    }
  };

  const handleProductClick = (productId: string) => {
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
        <h1 style={{ marginBottom: '20px' }}>Sản phẩm đã xem</h1>
        <p style={{ marginBottom: '20px', color: '#6b7280' }}>
          Vui lòng đăng nhập để xem lịch sử các sản phẩm bạn đã xem.
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
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
          Sản phẩm đã xem
        </h1>
        {viewedProducts.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={clearing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: clearing ? 'not-allowed' : 'pointer',
              opacity: clearing ? 0.6 : 1
            }}
          >
            {clearing ? 'Đang xóa...' : 'Xóa tất cả'}
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>
              {stats.totalViews}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Tổng lượt xem
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.uniqueProducts}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Sản phẩm duy nhất
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.lastViewed ? new Date(stats.lastViewed).toLocaleDateString('vi-VN') : 'Không có'}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Lần xem cuối
            </div>
          </div>
        </div>
      )}

      {loading && viewedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Đang tải danh sách đã xem...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#e53e3e', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={fetchViewedProducts}
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
      ) : viewedProducts.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 0',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👁️</div>
          <h2 style={{ marginBottom: '10px', color: '#374151' }}>
            Chưa có sản phẩm nào được xem
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            Lịch sử xem sản phẩm của bạn sẽ hiển thị tại đây
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
            {viewedProducts.map((viewedProduct) => {
              const product = typeof viewedProduct.productId === 'object' 
                ? viewedProduct.productId 
                : null;
              
              if (!product) return null;

              return (
                <div key={viewedProduct._id} style={{ position: 'relative' }}>
                  <ProductCard 
                    product={product}
                    onProductClick={handleProductClick}
                  />
                  {/* View info overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Xem {viewedProduct.viewCount} lần</span>
                    <span>{new Date(viewedProduct.lastViewedAt).toLocaleDateString('vi-VN')}</span>
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
              
              <span style={{ 
                padding: '10px',
                color: '#374151'
              }}>
                Trang {currentPage} / {pagination.totalPages}
              </span>

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

export default ViewedProductsPage;