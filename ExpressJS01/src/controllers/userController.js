const {
  createUserService,
  loginService,
  getUserService
} = require("../services/userService");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await createUserService(name, email, password);
  return res.status(200).json(result);
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const result = await loginService(email, password);
  return res.status(200).json(result);
};

const getUser = async (req, res) => {
  const result = await getUserService();
  return res.status(200).json(result);
};

const getAccount = async (req, res) => {
  return res.status(200).json({ message: "ok" });
};

module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount
};