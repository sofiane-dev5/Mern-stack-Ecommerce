const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  description: {type: String, required: true},
  image: {type: String, required: true},
  price: {type: Number, required: true},
  category: {
    type: String,
    enum: ['men', 'women', 'bebies']
  },
  productType: {
    type: String,
    enum: ['clothes', 'shoes']
  },
  size: {
    type: [String]
  },
  soldePercentage: {type: Number, default: 0},
  amount: {type: Number},
  isNewProd: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now}
});

module.exports = Product = mongoose.model('product', productSchema);