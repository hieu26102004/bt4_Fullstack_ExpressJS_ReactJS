import React, { useState } from 'react';
import { resetPasswordApi } from '../util/api';
import { useLocation } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState(() => {
    // Nếu có email truyền qua location.state thì lấy luôn
    if (location && location.state && (location.state as any).email) {
      return (location.state as any).email;
    }
    return '';
  });
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
  await resetPasswordApi(email, otp, newPassword);
      setMessage('Đặt lại mật khẩu thành công!');
    } catch (err: any) {
      setMessage('OTP không hợp lệ hoặc có lỗi xảy ra.');
    }
    setLoading(false);
  };

  return (
    <div className="reset-password-container">
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nhập mã OTP 6 số"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
          maxLength={6}
        />
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
