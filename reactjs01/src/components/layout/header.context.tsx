import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, UsergroupAddOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { AuthContext } from '../context/auth.context';

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

  const items = [
    {
      label: <Link to="/">Home Page</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to="/user">Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: `Welcome ${auth?.user?.email ?? ""}`,
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
            ]),
      ],
    },
  ];

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;