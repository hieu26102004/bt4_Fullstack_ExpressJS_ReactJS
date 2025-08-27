import React, { useState } from 'react';
import { forgotPasswordApi } from '../util/api';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
  await forgotPasswordApi(email);
  // Chuyển sang trang reset-password và truyền email qua state
  navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi OTP'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
