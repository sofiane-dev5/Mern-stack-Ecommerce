const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true, maxlength: 32},
  email: {type: String, required: true, trim: true, unique: true},
  password: {type: String, required: true},
  about: {type: String},
  role: {type: String, enum: ['user'], default: 'user'},
  history: {type: Array, default: []}
}, {timestamps: true});

module.exports = User = mongoose.model('user', userSchema);