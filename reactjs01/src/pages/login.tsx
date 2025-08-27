import { Form, Input, Button, notification, Divider, Row, Col } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../util/api';

interface LoginResponse {
  code?: number;
  access_token?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    __v?: number;
  };
}

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { email, password } = values;
    try {
      const res = await loginApi(email, password);
      const data = res.data as LoginResponse;
      if (data?.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        notification.success({
          message: 'Đăng nhập thành công',
          description: `Chào mừng ${data.user?.name || data.user?.email}`,
        });
        navigate('/');
      } else {
        notification.error({
          message: 'Đăng nhập thất bại',
          description: 'Vui lòng kiểm tra lại thông tin.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi hệ thống',
        description: 'Không thể kết nối đến máy chủ.',
      });
    }
  };

  return (
    <Row justify="center" style={{ paddingTop: 50 }}>
      <Col span={8}>
        <Form
          name="login"
          onFinish={onFinish}
          style={{
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <legend style={{ marginBottom: 16 }}>Đăng nhập tài khoản</legend>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
            <Link to="/" style={{ marginLeft: 16 }}>Quay lại trang chủ</Link>
          </Form.Item>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
          </div>
        </Form>
      </Col>
    </Row>
  );
};

export default LoginPage;