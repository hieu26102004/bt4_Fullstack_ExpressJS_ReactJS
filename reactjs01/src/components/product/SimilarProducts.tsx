import React, { useState, useEffect } from 'react';
import { getAllSimilarProductsApi } from '../../util/api';
import ProductCard from './ProductCard';
import type { Product, SimilarProductsResponse, ApiResponse } from '../../types/product.types';

interface SimilarProductsProps {
  productId: string;
  limit?: number;
  showTitle?: boolean;
  title?: string;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  productId,
  limit = 6,
  showTitle = true,
  title = 'Sản phẩm tương tự'
}) => {
  const [similarProducts, setSimilarProducts] = useState<SimilarProductsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommended' | 'category' | 'tags' | 'price'>('recommended');

  useEffect(() => {
    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId, limit]);

  const fetchSimilarProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllSimilarProductsApi(productId, limit);
      const data = response.data as ApiResponse<SimilarProductsResponse>;
      if (data?.success) {
        setSimilarProducts(data.data || null);
      } else {
        setError('Không thể tải sản phẩm tương tự');
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
      setError('Có lỗi xảy ra khi tải sản phẩm tương tự');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Đang tải sản phẩm tương tự...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#e53e3e' }}>
        <p>{error}</p>
        <button 
          onClick={fetchSimilarProducts}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
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
    );
  }

  if (!similarProducts) {
    return null;
  }

  const getCurrentProducts = (): Product[] => {
    switch (activeTab) {
      case 'category':
        return similarProducts.byCategory || [];
      case 'tags':
        return similarProducts.byTags || [];
      case 'price':
        return similarProducts.byPrice || [];
      default:
        return similarProducts.recommended || [];
    }
  };

  const currentProducts = getCurrentProducts();

  if (currentProducts.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Không có sản phẩm tương tự nào.</p>
      </div>
    );
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? '#3182ce' : '#f7fafc',
    color: isActive ? 'white' : '#2d3748',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ padding: '20px 0' }}>
      {showTitle && (
        <h3 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          {title}
        </h3>
      )}
      
      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button
          style={tabStyle(activeTab === 'recommended')}
          onClick={() => setActiveTab('recommended')}
        >
          Đề xuất ({similarProducts.recommended?.length || 0})
        </button>
        <button
          style={tabStyle(activeTab === 'category')}
          onClick={() => setActiveTab('category')}
        >
          Cùng danh mục ({similarProducts.byCategory?.length || 0})
        </button>
        <button
          style={tabStyle(activeTab === 'tags')}
          onClick={() => setActiveTab('tags')}
        >
          Cùng thẻ ({similarProducts.byTags?.length || 0})
        </button>
        <button
          style={tabStyle(activeTab === 'price')}
          onClick={() => setActiveTab('price')}
        >
          Cùng tầm giá ({similarProducts.byPrice?.length || 0})
        </button>
      </div>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {currentProducts.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;