require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

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

module.exports = {
  createUserService,
  loginService,
  getUserService
};