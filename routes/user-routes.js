const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/user-controller');
const {checkAuth, authorize} = require('../middleware/auth');

router.get('/', checkAuth, authorize('admin'), usersController.getUsers);
router.get('/:id', checkAuth, authorize('admin'), usersController.getUser);
router.put('/:id', checkAuth, authorize('admin'), usersController.updateUser);
router.delete('/:id', checkAuth, authorize('admin'), usersController.deleteUser);

router.post('/signup', [
  check('name').not().isEmpty().withMessage('Name is required.'),
  check('name').isLength({ min: 3 }).withMessage('Name must have at least 3 characters.'),
  check('email').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Password is required.'),
  check('password').isLength({ min: 6 }).withMessage('Password must have at least 6 characters.')
], usersController.signup);

router.post('/login', usersController.login);

module.exports = router;