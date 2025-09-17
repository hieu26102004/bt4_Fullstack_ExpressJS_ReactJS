import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const items: BreadcrumbItem[] = [
      { title: 'Trang chủ', path: '/' }
    ];
    
    // Map pathnames to Vietnamese titles
    const pathMap: Record<string, string> = {
      'search': 'Tìm kiếm sản phẩm',
      'favorites': 'Sản phẩm yêu thích',
      'viewed-products': 'Sản phẩm đã xem',
      'user': 'Quản lý tài khoản',
      'login': 'Đăng nhập',
      'register': 'Đăng ký',
      'forgot-password': 'Quên mật khẩu',
      'reset-password': 'Đặt lại mật khẩu',
      'products': 'Chi tiết sản phẩm',
      'category': 'Danh mục'
    };
    
    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      const title = pathMap[name] || name;
      const isLast = index === pathnames.length - 1;
      
      items.push({
        title,
        path: isLast ? undefined : currentPath
      });
    });
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  // Don't show breadcrumb on home page
  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <nav style={{
      padding: '12px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      fontSize: '14px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span style={{ color: '#6c757d', margin: '0 4px' }}>
                /
              </span>
            )}
            {item.path ? (
              <Link 
                to={item.path} 
                style={{ 
                  color: '#007bff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {index === 0 && <HomeOutlined />}
                {item.title}
              </Link>
            ) : (
              <span style={{ 
                color: '#6c757d',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {index === 0 && <HomeOutlined />}
                {item.title}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;