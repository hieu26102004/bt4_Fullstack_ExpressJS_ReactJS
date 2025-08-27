require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const white_lists = ["/register", "/login"];

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

        console.log(">>> check token: ", decoded);
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