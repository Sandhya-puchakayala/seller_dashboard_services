const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new seller
// @route   POST /api/sellers/register
// @access  Public
const registerSeller = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  try {
    // Check if seller exists
    const sellerExists = await Seller.findOne({ email });

    if (sellerExists) {
      return res.status(400).json({ message: 'Seller already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create seller
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    if (seller) {
      res.status(201).json({
        _id: seller.id,
        name: seller.name,
        email: seller.email,
        token: generateToken(seller._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid seller data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a seller
// @route   POST /api/sellers/login
// @access  Public
const loginSeller = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for seller email
    const seller = await Seller.findOne({ email });

    if (seller && (await bcrypt.compare(password, seller.password))) {
      res.json({
        _id: seller.id,
        name: seller.name,
        email: seller.email,
        token: generateToken(seller._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller shop details
// @route   PUT /api/sellers/shop
// @access  Private
const updateShop = async (req, res) => {
  const { shopName, address, description } = req.body;

  try {
    const seller = await Seller.findById(req.sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.shopDetails = {
      shopName: shopName || seller.shopDetails?.shopName,
      address: address || seller.shopDetails?.address,
      description: description || seller.shopDetails?.description,
    };

    const updatedSeller = await seller.save();

    res.json({
      shopDetails: updatedSeller.shopDetails
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update all seller account details
// @route   PUT /api/sellers/account
// @access  Private
const updateAccount = async (req, res) => {
  const { name, phone, shopName, address, description, gstNumber, documents } = req.body;

  try {
    const seller = await Seller.findById(req.sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (name) seller.name = name;
    if (phone) seller.phone = phone;
    
    seller.shopDetails = {
      shopName: shopName || seller.shopDetails?.shopName,
      address: address || seller.shopDetails?.address,
      description: description || seller.shopDetails?.description,
    };

    if (gstNumber) seller.gstNumber = gstNumber;
    
    // Append or replace documents?
    // Let's assume frontend sends the an array of current documents (or we just maintain whatever is sent)
    if (documents) {
      if (Array.isArray(documents)) {
         seller.documents = documents;
      } else {
         seller.documents.push(documents); // if single string
      }
    }

    const updatedSeller = await seller.save();

    res.json({
      seller: {
        _id: updatedSeller._id,
        name: updatedSeller.name,
        email: updatedSeller.email,
        phone: updatedSeller.phone,
        shopDetails: updatedSeller.shopDetails,
        gstNumber: updatedSeller.gstNumber,
        documents: updatedSeller.documents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a product
// @route   POST /api/sellers/products
// @access  Private
const addProduct = async (req, res) => {
  const { 
    name, description, shortDescription, price, salePrice, sku, image, images, type, category, 
    status, stock, stockStatus, shipping, linked, isVirtual, isDownloadable 
  } = req.body;

  if (!name || price === undefined) {
     return res.status(400).json({ message: 'Please provide required product fields (name, price)' });
  }

  try {
    const product = await Product.create({
      name,
      description,
      shortDescription,
      price,
      salePrice,
      sku,
      image,
      images: images || [],
      type: type || 'Simple product',
      category,
      status: status || 'Draft',
      stock: stock || 0,
      stockStatus: stockStatus || 'In stock',
      shipping: shipping || { weight: 0, dimensions: { length: 0, width: 0, height: 0 }, shippingClass: 'No shipping class' },
      linked: linked || { upsells: [], crossSells: [] },
      isVirtual: isVirtual || false,
      isDownloadable: isDownloadable || false,
      seller: req.sellerId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/sellers/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/sellers/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for a seller
// @route   GET /api/sellers/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId).select('-password');
    const products = await Product.find({ seller: req.sellerId });
    const orders = await Order.find({ seller: req.sellerId }).populate('products.product', 'name price');
    const payments = await Payment.find({ seller: req.sellerId }).populate('order', 'totalAmount status');

    res.json({
      seller,
      products,
      orders,
      payments,
    });
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
}

module.exports = {
  registerSeller,
  loginSeller,
  updateShop,
  updateAccount,
  addProduct,
  updateProduct,
  deleteProduct,
  getDashboard,
};
