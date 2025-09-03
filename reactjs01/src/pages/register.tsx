import { Form, Input, Button, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { createUserApi } from '../util/api';

interface RegisterResponse {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  __v?: number;
}

const RegisterPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { name, email, password } = values;
    try {
      const res = await createUserApi(name, email, password);
      const data = res.data as RegisterResponse;
      if (data) {
        notification.success({
          message: 'Đăng ký thành công',
          description: 'Bạn có thể đăng nhập ngay bây giờ.',
        });
        navigate('/login');
      } else {
        notification.error({
          message: 'Đăng ký thất bại',
          description: 'Vui lòng thử lại.',
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
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 50 }}>
      <Form
        name="register"
        onFinish={onFinish}
        style={{
          width: 400,
          padding: 24,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <legend style={{ marginBottom: 16 }}>Đăng ký tài khoản</legend>

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

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Link to="/" style={{ marginLeft: 16 }}>
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;