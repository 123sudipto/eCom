const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.use(auth.protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router; 