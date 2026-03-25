const express = require('express');
const router = express.Router();
const {
  registerSeller,
  loginSeller,
  updateShop,
  updateAccount,
  addProduct,
  updateProduct,
  deleteProduct,
  getDashboard,
} = require('../controllers/sellerController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.put('/shop', protect, updateShop);
router.put('/account', protect, updateAccount);
router.post('/products', protect, addProduct);
router.put('/products/:id', protect, updateProduct);
router.delete('/products/:id', protect, deleteProduct);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
