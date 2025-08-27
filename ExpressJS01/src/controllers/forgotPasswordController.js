// controllers/forgotPasswordController.js
const { sendForgotPasswordOTPService } = require('../services/userService');
const { sendMail } = require('../utils/mailer');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Vui lòng nhập email' });
  }
  const result = await sendForgotPasswordOTPService(email, sendMail);
  if (result.code === 0) {
    return res.json({ message: result.message });
  }
  if (result.code === 1) {
    return res.status(404).json({ message: result.message });
  }
  return res.status(500).json({ message: result.message, error: result.error });
};
