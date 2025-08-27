require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'mongodb';
let db = null;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const MONGO_URI = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/mongodb';
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = mongoose;
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
} else if (DB_TYPE === 'mysql') {
  const Sequelize = require('sequelize');
  const MYSQL_DB = process.env.MYSQL_DB || 'express01';
  const MYSQL_USER = process.env.MYSQL_USER || 'root';
  const MYSQL_PASS = process.env.MYSQL_PASS || '';
  const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
  const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASS, {
    host: MYSQL_HOST,
    dialect: 'mysql',
    logging: false,
  });
  db = sequelize;
  sequelize.authenticate()
    .then(() => {
      console.log('MySQL connected');
    })
    .catch(err => {
      console.error('MySQL connection error:', err);
    });
}

module.exports = db;