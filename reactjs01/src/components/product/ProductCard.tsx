import React from 'react';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const handleClick = () => {
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

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className="product-card" 
      onClick={handleClick}
      style={{ cursor: onProductClick ? 'pointer' : 'default' }}
    >
      <div className="product-image-container">
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
      
      <div className="product-info">
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
      </div>
    </div>
  );
};

export default ProductCard;
