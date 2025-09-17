import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Divider } from 'antd';
import { 
  ShoppingOutlined, 
  SearchOutlined, 
  HeartOutlined, 
  EyeOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../components/context/auth.context';
import { getTrendingProductsApi, getAllProductsApi } from '../util/api';
import ProductCard from '../components/product/ProductCard';
import type { Product } from '../types/product.types';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending and featured products
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch trending products
        const trendingResponse = await getTrendingProductsApi();
        if (trendingResponse?.data && Array.isArray(trendingResponse.data)) {
          setTrendingProducts(trendingResponse.data.slice(0, 4));
        }

        // Fetch featured products (latest products)
        const featuredResponse = await getAllProductsApi({
          page: 1,
          limit: 4,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        if (featuredResponse?.data && Array.isArray(featuredResponse.data)) {
          setFeaturedProducts(featuredResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const quickActions = [
    {
      title: 'Tìm kiếm nâng cao',
      description: 'Tìm kiếm sản phẩm với bộ lọc chi tiết',
      icon: <SearchOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      action: () => navigate('/search'),
      color: '#e6f7ff'
    },
    ...(isAuthenticated ? [
      {
        title: 'Sản phẩm yêu thích',
        description: 'Xem danh sách sản phẩm đã lưu',
        icon: <HeartOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
        action: () => navigate('/favorites'),
        color: '#fff0f6'
      },
      {
        title: 'Sản phẩm đã xem',
        description: 'Lịch sử các sản phẩm đã xem',
        icon: <EyeOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
        action: () => navigate('/viewed-products'),
        color: '#f6ffed'
      }
    ] : []),
    {
      title: 'Quản lý tài khoản',
      description: isAuthenticated ? 'Cài đặt tài khoản và thông tin' : 'Đăng nhập để trải nghiệm đầy đủ',
      icon: <StarOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      action: () => navigate(isAuthenticated ? '/user' : '/login'),
      color: '#fff7e6'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Welcome Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
          {isAuthenticated && user?.name 
            ? `Xin chào, ${user.name}!` 
            : 'Chào mừng đến với cửa hàng của chúng tôi'}
        </Title>
        <Paragraph style={{ color: 'white', fontSize: '18px', marginBottom: '24px' }}>
          Khám phá bộ sưu tập sản phẩm đa dạng và chất lượng cao
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          icon={<ShoppingOutlined />}
          onClick={() => navigate('/search')}
          style={{ 
            height: '48px',
            fontSize: '16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderColor: 'rgba(255,255,255,0.3)'
          }}
        >
          Bắt đầu mua sắm
        </Button>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Chức năng nhanh
        </Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                style={{ 
                  height: '200px',
                  backgroundColor: action.color,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={action.action}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  {action.icon}
                </div>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {action.title}
                </Title>
                <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {action.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <Title level={2} style={{ margin: 0 }}>
              <FireOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
              Sản phẩm thịnh hành
            </Title>
            <Button type="link" onClick={() => navigate('/search')}>
              Xem tất cả →
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {trendingProducts.map((product) => (
              <Col xs={24} sm={12} lg={6} key={product._id}>
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                  showStats={true}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <Title level={2} style={{ margin: 0 }}>
              <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
              Sản phẩm mới nhất
            </Title>
            <Button type="link" onClick={() => navigate('/search')}>
              Xem tất cả →
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {featuredProducts.map((product) => (
              <Col xs={24} sm={12} lg={6} key={product._id}>
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                  showStats={false}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>
            Đang tải nội dung...
          </div>
        </div>
      )}

      {/* Footer Info */}
      <Divider />
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <Title level={4}>Về cửa hàng của chúng tôi</Title>
        <Paragraph style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Chúng tôi cam kết mang đến cho bạn những sản phẩm chất lượng cao với giá cả phải chăng. 
          Với hệ thống tìm kiếm thông minh và các tính năng cá nhân hóa, 
          chúng tôi giúp bạn dễ dàng tìm thấy những sản phẩm ưng ý nhất.
        </Paragraph>
      </div>
    </div>
  );
};

export default HomePage;