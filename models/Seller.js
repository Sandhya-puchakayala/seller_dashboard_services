const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  shopDetails: {
    shopName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  documents: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
