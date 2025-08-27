const express = require('express');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');

const routerAPI = express.Router();


// Auth routes
routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

// Protected routes
routerAPI.get('/user', auth, getUser);
routerAPI.get('/account', auth, delay, getAccount);
// Wildcard route (should be last)
routerAPI.use((req, res) => {
  res.status(200).json({ message: "Hello world api" });
});

module.exports = routerAPI;