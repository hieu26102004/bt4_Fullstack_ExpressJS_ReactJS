import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, UsergroupAddOutlined, SettingOutlined, SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Menu, Input } from 'antd';
import { AuthContext } from '../context/auth.context';

const { Search } = Input;

const Header = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext not found");
  const { auth, setAuth } = context;
  const navigate = useNavigate();
  const [current, setCurrent] = useState('home');

  const onClick = (e: any) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  const onSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const items = [
    {
      label: <Link to="/">Trang chủ</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to="/products">Sản phẩm</Link>,
      key: 'products',
      icon: <ShoppingOutlined />,
    },
    {
      label: <Link to="/search">Tìm kiếm nâng cao</Link>,
      key: 'search',
      icon: <SearchOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to="/user">Quản lý</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: `${auth?.user?.email ? `Xin chào, ${auth.user.email}` : 'Tài khoản'}`,
      key: 'SubMenu',
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: (
                  <span
                    onClick={() => {
                      localStorage.clear();
                      setAuth({
                        isAuthenticated: false,
                        user: { email: '', name: '', id: '' },
                      });
                      setCurrent('home');
                      navigate('/login');
                    }}
                  >
                    Đăng xuất
                  </span>
                ),
                key: 'logout',
              },
            ]
          : [
              {
                label: <Link to="/login">Đăng nhập</Link>,
                key: 'login',
              },
              {
                label: <Link to="/register">Đăng ký</Link>,
                key: 'register',
              },
            ]),
      ],
    },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 20px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{ flex: '1', minWidth: '0' }}>
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
          style={{ border: 'none' }}
        />
      </div>
      <div style={{ 
        marginLeft: '20px',
        minWidth: '300px'
      }}>
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          enterButton="Tìm kiếm"
          size="middle"
          onSearch={onSearch}
          style={{ maxWidth: '400px' }}
        />
      </div>
    </div>
  );
};

export default Header;