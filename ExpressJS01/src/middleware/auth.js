require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const white_lists = ["/register", "/login", "/forgot-password"];

  if (white_lists.find(item => "/api/v1" + item === req.originalUrl)) {
    next();
  } else {
    const token = req?.headers?.authorization?.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.email = decoded.email;
        req.name = decoded.name;
        req.createdBy = "hieu";
        
        // Check if token has id, if not, suggest relogin
        if (!decoded.id && !decoded._id) {
          console.warn("Token doesn't have user id, user should relogin");
          return res.status(401).json({
            message: "Token cũ không hợp lệ, vui lòng đăng nhập lại",
            code: "TOKEN_OUTDATED"
          });
        }
        
        // Set user object for new controllers
        req.user = {
          id: decoded.id || decoded._id,
          email: decoded.email,
          name: decoded.name
        };

        console.log(">>> check token: ", decoded);
        console.log(">>> req.user set to: ", req.user);
        next();
      } catch (error) {
        return res.status(401).json({
          message: "Token bị hết hạn hoặc không hợp lệ"
        });
      }
    } else {
      return res.status(401).json({
        message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn"
      });
    }
  }
};

module.exports = auth;