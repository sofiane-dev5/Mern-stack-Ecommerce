const User = require('../models/User');
const { validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const HttpError = require('../models/HttpError');

// @desc    Get users
// @route   Get /api/users
// @access  Private/admin 

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({ role: 'user' });
  } catch (error) {
    return next(new HttpError('Cannot get users, please try later.'));
  }

  res.status(200).json({ users });
};

// @desc    Get single user
// @route   Get /api/users/:id
// @access  Private/admin 

const getUser = async (req, res, next) => {
  let userId = req.params.id;
  let isValid = ObjectId.isValid(userId);
  if (!isValid) {
    return next(new HttpError('Invalid user id.', 500));
  }

  let user;
  try {
    user = await User.findById(userId).select('-password');
  } catch (error) {
    return next(new HttpError('Cannot get user, please try later.'));
  }

  if (!user) {
    return next(new HttpError('No user for the provided id.'));
  }

  res.status(200).json({ user });

};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/admin 

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }

  let userId = req.params.id;
  let isValid = ObjectId.isValid(userId);
  if (!isValid) {
    return next(new HttpError('Invalid user id.', 500));
  }

  const { name, email, password } = req.body;
  let updatedUser;
  try {
    updatedUser = await User.findById(req.params.id);
  } catch (error) {
    return next(new HttpError('Update user failed, please try later.'));
  }

  updatedUser.name = name;
  updatedUser.email = email;
  updatedUser.password = password;

  await updatedUser.save();

  res.status(200).json({ updatedUser });
};

// @desc    delete user
// @route   DELETE /api/users/:id
// @access  Private/admin

const deleteUser = async (req, res, next) => {
  let userId = req.params.id;
  let isValid = ObjectId.isValid(userId);
  if (!isValid) {
    return next(new HttpError('Invalid user id.', 500));
  }
  let deletedUser;
  try {
    deletedUser = await User.findById(userId);
  } catch (error) {
    return next(new HttpError('Delete user failed, please try later.'));
  }

  if (!deletedUser) {
    return next(new HttpError('No user for the provided id.', 401));
  }

  await deletedUser.remove();

  res.status(400).json({ message: 'User deleted. '});
};

// @desc    user signup
// @route   POST /api/users/signup
// @access  Public 

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

  res.status(201).json({ userId: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, token });

}

// @desc    user login
// @route   POST /api/users/login
// @access  Public

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
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;