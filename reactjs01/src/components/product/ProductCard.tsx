import React from 'react';
import type { Product } from '../../types/product.types';
import FavoriteButton from './FavoriteButton';
import { addViewedProductApi } from '../../util/api';
import { useAuth } from '../context/auth.context';

interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
  showStats?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onProductClick,
  showStats = true 
}) => {
  const { user } = useAuth();

  const handleClick = () => {
    // Track product view when user actually clicks
    if (user && product._id) {
      addViewedProductApi(product._id).catch(console.error);
    }
    
    if (onProductClick) {
      onProductClick(product._id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className="product-card" 
      style={{ cursor: onProductClick ? 'pointer' : 'default', position: 'relative' }}
    >
      <div className="product-image-container" onClick={handleClick}>
        <img 
          src={product.images[0] || 'https://via.placeholder.com/300x300?text=No+Image'} 
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {discountPercentage > 0 && (
          <div className="discount-badge">
            -{discountPercentage}%
          </div>
        )}

        <div className="product-overlay">
          <button className="quick-view-btn">Xem nhanh</button>
        </div>
      </div>
      
      <div className="product-info" onClick={handleClick}>
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>
        
        <div className="product-category">
          {typeof product.categoryId === 'object' && product.categoryId?.name}
        </div>
        
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`star ${index < Math.floor(product.rating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">
            ({product.rating.toFixed(1)}) · {product.reviewCount} đánh giá
          </span>
        </div>
        
        <div className="product-pricing">
          <div className="current-price">
            {formatPrice(product.price)}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="original-price">
              {formatPrice(product.originalPrice)}
            </div>
          )}
        </div>

        {/* Product Statistics */}
        {showStats && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            padding: '4px 0',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(product.viewCount || 0) > 0 && (
                <span title="Lượt xem">
                  👁️ {formatNumber(product.viewCount || 0)}
                </span>
              )}
              {(product.favoriteCount || 0) > 0 && (
                <span title="Lượt yêu thích">
                  ❤️ {formatNumber(product.favoriteCount || 0)}
                </span>
              )}
              {(product.purchaseCount || 0) > 0 && (
                <span title="Đã bán">
                  🛒 {formatNumber(product.purchaseCount || 0)}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">Còn {product.stock} sản phẩm</span>
          ) : (
            <span className="out-of-stock">Hết hàng</span>
          )}
        </div>
        
        <div className="product-tags">
          {product.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          gap: '8px'
        }}>
          <button
            onClick={handleClick}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            Xem chi tiết
          </button>
          
          <FavoriteButton productId={product._id} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
