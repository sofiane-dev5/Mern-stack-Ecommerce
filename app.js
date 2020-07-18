const path = require('path');

const express = require('express');
const dotenv = require('dotenv');

const connectDB = require('./db');
const usersRoutes = require('./routes/user-routes');
const productsRoutes = require('./routes/products-routes');

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname)));

// routes middleware
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);

const PORT = process.env.PORT || 5000;

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occured.' });
});

connectDB();

app.listen(PORT);