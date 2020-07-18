const fs = require('fs');

const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;

const HttpError = require('../models/HttpError');


// @desc    Get products
// @route   GET /api/product/new
// @access  Public

exports.getProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find();
  } catch (error) {
    return next(new HttpError('Fetching products failed, please try later.'));
  }

  if (!products) {
    return next(new HttpError('Fetching products failed, please try later.'));
  }

  res.status(200).json({ products });
};

// @desc    Create product
// @route   POST /api/product/new
// @access  Private/admin 

exports.createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, amount, category, productType, size } = req.body;

  let product;
  try {
    product = await Product.findOne({ name: name });
  } catch (error) {
    return next(new HttpError('Cannot create product, try later.'));
  }

  if (product) {
    return next(new HttpError('A product already exists with this name.', 401));
  }

  const newProduct = new Product({
    name,
    description,
    price,
    image: req.file.path,
    amount: amount || null,
    category,
    productType,
    size
  });
  
  await newProduct.save();
  res.status(201).json({ newProduct });
};

// @desc    Update product
// @route   PATCH /api/product/:prodId
// @access  Private/admin 

exports.updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const prodId = req.params.prodId;
  let isValid = ObjectId.isValid(prodId);
  if (!isValid) {
    return next(new HttpError('Invalid user id.', 500));
  }

  const { name, description, price, soldePercentage, amount, size, isNewProd } = req.body;

  let product;
  try {
    product = await Product.findById(prodId);
  } catch (error) {
    return next(new HttpError('Cannot update product, please try later.'));
  }

  if (!product) {
    return next(new HttpError('There is no product for the provided id.', 401));
  }

  product.name = name || product.name;
  product.description = description;
  product.price = price || product.price;
  product.soldePercentage = soldePercentage || product.soldePercentage;
  product.amount = amount || product.amount;
  product.size = size || product.size;
  product.isNewProd = isNewProd || product.isNewProd;

  await product.save();

  res.status(200).json({ product });
};

// @desc    Delete product
// @route   DELETE /api/product/:prodId
// @access  Private/admin 

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.prodId;
  let isValid = ObjectId.isValid(prodId);
  if (!isValid) {
    return next(new HttpError('Invalid user id.', 500));
  }

  let product;
  try {
    product = await Product.findById(prodId);
  } catch (error) {
    return next(new HttpError('Cannot delete product, please try later.'));
  }

  if (!product) {
    return next(new HttpError('There is no product for the provided id.', 401));
  }

  const imagePath = product.image;

  await product.remove();

  fs.unlink(imagePath, err => {
    console.error(err);
  });
  res.status(200).json({ message: 'Product deleted successfully.' });
};

