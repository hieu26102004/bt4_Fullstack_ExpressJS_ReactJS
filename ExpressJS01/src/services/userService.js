require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

// Tìm user theo email (phục vụ quên mật khẩu)
const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    return null;
  }
};

const createUserService = async (name, email, password) => {
  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      console.log(`>>> User exists, chọn 1 email khác: ${email}`);
      return null;
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Save new user to database
    const result = await User.create({
      name,
      email,
      password: hashPassword,
      role: "User"
    });

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const loginService = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        code: 2,
        message: "Email/Password không hợp lệ"
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        code: 2,
        message: "Email/Password không hợp lệ"
      };
    }

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      code: 0,
      access_token: token,
      user
    };
  } catch (error) {
    console.log(error);
    return {
      code: 1,
      message: "Đã xảy ra lỗi trong quá trình đăng nhập"
    };
  }
};

const getUserService = async () => {
  try {
    const result = await User.find({}).select("-password");
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const verifyOTPAndResetPasswordService = async (email, otp, newPassword) => {
  const user = await findUserByEmail(email);
  if (!user || !user.resetOTP || !user.resetOTPExpire) {
    return { code: 1, message: 'Không hợp lệ hoặc chưa yêu cầu OTP' };
  }
  if (user.resetOTP !== otp) {
    return { code: 2, message: 'OTP không đúng' };
  }
  if (user.resetOTPExpire < new Date()) {
    return { code: 3, message: 'OTP đã hết hạn' };
  }
  const hashPassword = await bcrypt.hash(newPassword, saltRounds);
  user.password = hashPassword;
  user.resetOTP = undefined;
  user.resetOTPExpire = undefined;
  await user.save();
  return { code: 0, message: 'Đặt lại mật khẩu thành công' };
};

// Gửi OTP quên mật khẩu
const sendForgotPasswordOTPService = async (email, sendMail) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return { code: 1, message: 'Email không tồn tại' };
  }
  // Tạo mã OTP 6 số
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOTP = resetToken;
  user.resetOTPExpire = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();
  try {
    await sendMail(
      email,
      'Đặt lại mật khẩu',
      `Mã đặt lại mật khẩu của bạn: ${resetToken}`,
      `<p>Mã đặt lại mật khẩu của bạn: <b>${resetToken}</b></p>`
    );
    return { code: 0, message: 'Đã gửi hướng dẫn đặt lại mật khẩu qua email' };
  } catch (err) {
    return { code: 2, message: 'Gửi email thất bại', error: err.message };
  }
};
module.exports = {
  createUserService,
  loginService,
  getUserService,
  findUserByEmail,
  verifyOTPAndResetPasswordService,
  sendForgotPasswordOTPService,
};