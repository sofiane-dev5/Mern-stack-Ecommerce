const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

const productsController = require('../controllers/products-controller');
const {checkAuth, authorize} = require('../middleware/auth');

router.get('/', productsController.getProducts);

router.post('/new', checkAuth, authorize('admin'), fileUpload.single('image'), [
  check('name').not().isEmpty().withMessage('Name is required.'),
  check('name').isLength({ max: 30 }).withMessage('Name must not exceed 30 characters.'),
  check('description').not().isEmpty().withMessage('Description is required.'),
  check('description').isLength({ max: 255 }).withMessage('Description must not exceed 255 characters.'),
  check('price').not().isEmpty().withMessage('Price is required.'),
  check('price').isNumeric().withMessage('Price must be a number.')

], productsController.createProduct);

router.patch('/:prodId', checkAuth, authorize('admin'), [
  check('description').not().isEmpty().withMessage('Description is required.')
], productsController.updateProduct);

router.delete('/:prodId', checkAuth, authorize('admin'), productsController.deleteProduct);

module.exports = router;