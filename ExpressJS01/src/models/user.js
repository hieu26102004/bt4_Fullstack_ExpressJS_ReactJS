const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  resetOTP: String,
  resetOTPExpire: Date,
});

const User = mongoose.model('user', userSchema);

module.exports = User;