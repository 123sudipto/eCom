const express = require('express');
const User = require('../models/User.js');
const Order = require('../models/Order.js');
const { protect, admin } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/orderController');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages
} = require('../controllers/productController');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete admin user'
        });
      }
      await user.deleteOne();
      res.json({
        status: 'success',
        message: 'User removed'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin ?? user.isAdmin;

      const updatedUser = await user.save();
      res.json({
        status: 'success',
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin
        }
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res, next) => {
  try {
    const pageSize = 20;
    const page = Number(req.query.page) || 1;
    const status = req.query.status;

    const filter = {};
    if (status) filter.orderStatus = status;

    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'username email')
      .populate('orderItems.product', 'name')
      .sort('-createdAt')
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      status: 'success',
      data: {
        orders,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      {
        $match: {
          'paymentInfo.status': 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'username')
      .sort('-createdAt')
      .limit(5);

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalOrders,
        totalSales: totalSales[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard routes
router.get('/dashboard', protect, admin, getDashboardStats);

// Product management routes
router.post('/products', protect, admin, createProduct);
router.put('/products/:id', protect, admin, updateProduct);
router.delete('/products/:id', protect, admin, deleteProduct);
router.post('/products/upload', protect, admin, uploadImages);

module.exports = router; 