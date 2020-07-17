const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/user-controller');

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

router.post('/signup', [
  check('name').not().isEmpty().withMessage('Name is required.'),
  check('name').isLength({ min: 3 }).withMessage('Name must have at least 3 characters.'),
  check('email').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Password is required.'),
  check('password').isLength({ min: 6 }).withMessage('Password must have at least 6 characters.')
], usersController.signup);

router.post('/login', usersController.login);

module.exports = router;