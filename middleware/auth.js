const HttpError = require('../models/HttpError');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');


exports.checkAuth = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  // Get token from header
  try {
    const token = req.headers.authorization.split(' ')[1];  
    if (!token) {
      throw new Error('Authentication failed.');
    }

    // verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
    req.user = await User.findById(decodedToken.userId).select('-password');
    console.log(req.user);
    
    next();
  } catch (error) {
    return next(new HttpError('Authentication failed.', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError('Your are not authorized to access this route.', 403));
    }
    next();
  };
};