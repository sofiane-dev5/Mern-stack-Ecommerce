const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/user-controller');

router.post('/signup', [
  check('name').not().isEmpty().withMessage('Name is required.'),
  check('name').isLength({ min: 3 }).withMessage('Name must have at least 3 characters.'),
  check('email').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Password is required.'),
  check('password').isLength({ min: 6 }).withMessage('Password must have at least 6 characters.')
], userController.signup);

router.post('/login', userController.login);

module.exports = router;