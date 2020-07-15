const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const HttpError = require('../models/HttpError');

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('signing up failed, please try later.', 500));
  }

  if (existingUser) {
    return next(new HttpError('Cannot create user, email already exists.', 403));
  }

  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(12);
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (error) {
    return next(new HttpError('signing up failed, please try later.'));
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    about: ''
  });

  await newUser.save();

  let token;
  try {
    token = jwt.sign({userId: newUser.id, email: newUser.email}, process.env.JWT_SECRET, {expiresIn: '4h'} );
  } catch (error) {
    return next(new HttpError('Signing up failed, please try again.', 500));
  }

  res.status(201).json({ userId: newUser.id, name: newUser.name, email: newUser.email, token });

}

const login = async (req, res, next) => {

  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Login failed, please try later.'));
  }

  if (!user) {
    return next(new HttpError('Invalid Credentials.', 403));
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    return next(new HttpError('Login failed, please try later.'));
  }

  if (!isValidPassword) {
    return next(new HttpError('Invalid Credentials.', 403));
  }

  let token;
  try {
    token = jwt.sign({userId: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '4h'} );
  } catch (error) {
    return next(new HttpError('Logging in failed, please try again.', 500));
  }

  res.json({ userId: user.id, name: user.name, email: user.email, role: user.role, token });
};

exports.signup = signup;
exports.login = login;