// controllers/resetPasswordController.js
const { verifyOTPAndResetPasswordService } = require('../services/userService');

exports.verifyOTPAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Thiếu thông tin' });
  }
  const result = await verifyOTPAndResetPasswordService(email, otp, newPassword);
  if (result.code === 0) {
    return res.json({ message: result.message });
  }
  return res.status(400).json({ message: result.message });
};
