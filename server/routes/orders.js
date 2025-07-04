const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} = require('../controllers/orderController');

// User routes
router.post('/', protect, createOrder);
router.post('/:id/verify', protect, verifyPayment);
router.get('/my-orders', protect, getUserOrders);

// Admin routes
router.get('/admin', protect, admin, getAllOrders);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);
router.get('/admin/dashboard', protect, admin, getDashboardStats);

module.exports = router; 