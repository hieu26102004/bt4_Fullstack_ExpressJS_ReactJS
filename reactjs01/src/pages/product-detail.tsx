import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Product } from '../types/product.types';
import { 
  getProductByIdApi, 
  addToFavoritesApi, 
  removeFromFavoritesApi, 
  getFavoriteProductsApi,
  addViewedProductApi 
} from '../util/api';
import SimilarProducts from '../components/product/SimilarProducts';
import ProductReviews from '../components/product/ProductReviews';
import FavoriteButton from '../components/product/FavoriteButton';
import { useAuth } from '../components/context/auth.context';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('ProductDetail Auth State:', { isAuthenticated, user, productId });
    console.log('ProductDetail Component State:', { loading, error, product: !!product });
  }, [isAuthenticated, user, productId, loading, error, product]);

  // Fetch product details
  const fetchProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching product with ID:', productId);
      const response = await getProductByIdApi(productId);
      console.log('Product API response:', response);
      
      if (response?.data && (response.data as any).success) {
        // Backend returns {success: true, data: {product: ..., relatedProducts: ...}}
        const apiData = (response.data as any).data;
        if (apiData?.product) {
          const productData = apiData.product as Product;
          console.log('Setting product data from success response:', productData);
          setProduct(productData);
        } else {
          console.error('No product in success response:', apiData);
          setError('Không tìm thấy thông tin sản phẩm');
        }
      } else if (response?.data && (response.data as any).product) {
        const productData = (response.data as any).product as Product;
        console.log('Setting product data from direct response:', productData);
        setProduct(productData);
      } else if (response?.data) {
        // Check if the response.data itself is the product
        const responseData = response.data as any;
        if (responseData._id || responseData.id) {
          // It's a direct product object
          const productData = responseData as Product;
          console.log('Setting product data (direct object):', productData);
          setProduct(productData);
        } else {
          console.error('No product data in response:', response);
          setError('Không tìm thấy thông tin sản phẩm');
        }
      } else {
        console.error('No valid response data:', response);
        setError('Không tìm thấy thông tin sản phẩm');
      }
      
      // Record view if user is authenticated - don't fail if this fails
      if (isAuthenticated) {
        addViewedProductApi(productId).catch((viewError: any) => {
          console.warn('Failed to record product view:', viewError);
        });
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in favorites
  const checkFavoriteStatus = async () => {
    if (!isAuthenticated || !productId) return;
    
    try {
      const response = await getFavoriteProductsApi({ page: 1, limit: 1000 });
      if (response?.data && (response.data as any).products) {
        const isFav = (response.data as any).products.some(
          (fav: any) => fav.productId === productId
        );
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.warn('Failed to check favorite status:', error);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !productId || favoriteLoading) return;
    
    try {
      setFavoriteLoading(true);
      
      if (isFavorite) {
        await removeFromFavoritesApi(productId);
        setIsFavorite(false);
      } else {
        await addToFavoritesApi(productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };


  // Load data
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [productId, isAuthenticated]);

  if (loading) {
    console.log('ProductDetail: Showing loading state');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            marginBottom: '8px' 
          }}>
            Đang tải thông tin sản phẩm...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            color: '#dc2626', 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
          <button 
            onClick={fetchProduct}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          Không tìm thấy sản phẩm
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      {/* Product Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '40px', 
        marginBottom: '40px' 
      }}>
        {/* Product Image */}
        <div>
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg'}
            alt={product.name}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>

        {/* Product Info */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '16px' 
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              margin: 0,
              color: '#1a202c'
            }}>
              {product.name}
            </h1>
            
            {isAuthenticated && product?._id && (
              <FavoriteButton
                productId={product._id}
                onToggle={handleFavoriteToggle}
              />
            )}
          </div>

          {product.description && (
            <p style={{ 
              fontSize: '16px', 
              color: '#4a5568', 
              lineHeight: '1.6',
              marginBottom: '20px' 
            }}>
              {product.description}
            </p>
          )}

          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#e53e3e',
            marginBottom: '20px' 
          }}>
            {product.price?.toLocaleString('vi-VN')} VNĐ
          </div>

          {product.categoryId && (
            <div style={{ 
              display: 'inline-block',
              backgroundColor: '#e2e8f0',
              color: '#2d3748',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {typeof product.categoryId === 'string' ? product.categoryId : product.categoryId.name}
            </div>
          )}

          <button
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'block',
              width: '100%'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Product Reviews */}
      {product?._id && (
        <div style={{ marginBottom: '40px' }}>
          <ProductReviews productId={product._id} />
        </div>
      )}

      {/* Similar Products */}
      {product?._id && (
        <div>
          <SimilarProducts 
            productId={product._id}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;