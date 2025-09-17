import React, { useState, useEffect } from 'react';
import { toggleFavoriteApi, checkFavoriteStatusApi } from '../../util/api';
import { useAuth } from '../context/auth.context';
import type { ApiResponse, FavoriteStatusResponse } from '../../types/product.types';

interface FavoriteButtonProps {
  productId: string;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  favoriteCount?: number;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  size = 'medium',
  showCount = false,
  favoriteCount = 0,
  onToggle
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCount, setCurrentCount] = useState(favoriteCount);

  useEffect(() => {
    if (user && productId) {
      checkFavoriteStatus();
    }
  }, [user, productId]);

  const checkFavoriteStatus = async () => {
    if (!productId) {
      console.warn('FavoriteButton: productId is required');
      return;
    }
    
    try {
      const response = await checkFavoriteStatusApi(productId);
      const data = response.data as ApiResponse<FavoriteStatusResponse>;
      if (data?.success) {
        setIsFavorite(data.data?.isFavorite || false);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  useEffect(() => {
    setCurrentCount(favoriteCount);
  }, [favoriteCount]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng chức năng yêu thích');
      return;
    }

    if (!productId) {
      console.warn('FavoriteButton: productId is required for toggle');
      return;
    }

    setLoading(true);
    try {
      const response = await toggleFavoriteApi(productId);
      const data = response.data as ApiResponse<any>;
      if (data?.success) {
        const newIsFavorite = !isFavorite;
        setIsFavorite(newIsFavorite);
        
        if (newIsFavorite) {
          setCurrentCount(prev => prev + 1);
        } else {
          setCurrentCount(prev => Math.max(0, prev - 1));
        }
        
        onToggle?.(newIsFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Có lỗi xảy ra khi cập nhật yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: '16px', height: '16px' };
      case 'large':
        return { width: '28px', height: '28px' };
      default:
        return { width: '20px', height: '20px' };
    }
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    color: isFavorite ? '#e53e3e' : '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1
  };

  // Don't render if productId is missing
  if (!productId) {
    console.warn('FavoriteButton: productId is required');
    return null;
  }

  return (
    <button
      style={buttonStyle}
      onClick={handleToggleFavorite}
      disabled={loading}
      title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      <svg 
        style={getSizeStyle()}
        viewBox="0 0 24 24" 
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {showCount && (
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {currentCount}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;