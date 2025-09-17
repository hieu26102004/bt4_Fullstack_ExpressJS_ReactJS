import React, { useState, useEffect } from 'react';
import { getProductReviewsApi, addProductReviewApi } from '../../util/api';
import { useAuth } from '../context/auth.context';
import type { ProductReview, ReviewResponse, ApiResponse } from '../../types/product.types';

interface ProductReviewsProps {
  productId: string;
  showAddReview?: boolean;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  showAddReview = true
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, currentPage]);

  const fetchReviews = async () => {
    if (!productId) {
      console.warn('ProductReviews: productId is required');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching reviews for productId:', productId);
      const response = await getProductReviewsApi(productId, {
        page: currentPage,
        limit: 10,
        onlyApproved: true
      });
      console.log('Reviews API response:', response);
      
      const data = response.data as ApiResponse<ReviewResponse>;
      console.log('Parsed reviews data:', data);
      
      if (data?.success) {
        setReviews(data.data?.reviews || []);
        setPagination(data.data?.pagination);
        console.log('Set reviews:', data.data?.reviews);
      } else {
        console.warn('Reviews API returned unsuccessful response:', data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để thêm đánh giá');
      return;
    }

    if (!productId) {
      console.warn('ProductReviews: productId is required for review submission');
      return;
    }

    setSubmitting(true);
    try {
      const response = await addProductReviewApi(
        productId,
        newReview.rating,
        newReview.comment
      );
      const data = response.data as ApiResponse<ProductReview>;
      if (data?.success) {
        alert('Đánh giá của bạn đã được gửi và đang chờ duyệt');
        setNewReview({ rating: 5, comment: '' });
        setShowAddForm(false);
        // Refresh reviews
        fetchReviews();
      }
    } catch (error: any) {
      console.error('Error adding review:', error);
      alert(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'small' | 'medium' = 'small') => {
    const starSize = size === 'small' ? 16 : 20;
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill={star <= rating ? '#fbbf24' : '#e5e7eb'}
            stroke="#fbbf24"
            strokeWidth="1"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
    );
  };

  const renderRatingInput = () => {
    return (
      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill={star <= newReview.rating ? '#fbbf24' : '#e5e7eb'}
              stroke="#fbbf24"
              strokeWidth="1"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
        <span style={{ marginLeft: '8px', fontSize: '14px' }}>
          ({newReview.rating} sao)
        </span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Đang tải đánh giá...</p>
      </div>
    );
  }

  // Don't render if productId is missing
  if (!productId) {
    console.warn('ProductReviews: productId is required');
    return null;
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>
          Đánh giá sản phẩm ({pagination?.totalItems || 0})
        </h3>
        {showAddReview && user && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showAddForm ? 'Hủy' : 'Viết đánh giá'}
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <div style={{
          padding: '20px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#f7fafc'
        }}>
          <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
            Thêm đánh giá của bạn
          </h4>
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Đánh giá:
              </label>
              {renderRatingInput()}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Bình luận:
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: submitting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          {showAddReview && user && (
            <p style={{ marginTop: '10px' }}>
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          )}
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px' 
              }}>
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {review.userId.name}
                  </p>
                  {renderStars(review.rating)}
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {review.comment && (
                <p style={{ color: '#374151', lineHeight: '1.5' }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '20px' 
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3182ce',
                  color: currentPage === 1 ? '#6b7280' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Trước
              </button>
              <span style={{ 
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === pagination.totalPages ? '#e5e7eb' : '#3182ce',
                  color: currentPage === pagination.totalPages ? '#6b7280' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;