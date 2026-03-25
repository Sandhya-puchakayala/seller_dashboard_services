const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
  },
  sku: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL to image
  },
  images: [{
    type: String, // Array of extra gallery images
  }],
  type: {
    type: String,
    default: 'Simple product',
  },
  category: {
    type: String,
  },
  status: {
    type: String,
    default: 'Draft', // Draft, Online, Published
  },
  stock: {
    type: Number,
    default: 0,
  },
  stockStatus: {
    type: String,
    default: 'In stock',
  },
  shipping: {
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    shippingClass: { type: String, default: 'No shipping class' }
  },
  linked: {
    upsells: [{ type: String }],
    crossSells: [{ type: String }]
  },
  isVirtual: {
    type: Boolean,
    default: false,
  },
  isDownloadable: {
    type: Boolean,
    default: false,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
