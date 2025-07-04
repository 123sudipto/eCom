const Order = require('../models/Order');
const PaymentService = require('../services/paymentService');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check if size exists and has enough stock
      const sizeStock = product.sizes.find(s => s.size === item.size);
      if (!sizeStock || sizeStock.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} in size ${item.size}`
        });
      }
    }

    // Create Razorpay order
    const razorpayOrder = await PaymentService.createOrder(
      totalAmount,
      `order_${Date.now()}`
    );

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      paymentResult: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending'
      }
    });

    // Get Razorpay config for frontend
    const razorpayConfig = PaymentService.getFrontendConfig({
      name: 'Shoe Store',
      description: `Order #${order._id}`
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        razorpayConfig: {
          ...razorpayConfig,
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          prefill: {
            name: req.user.name,
            email: req.user.email,
            contact: shippingAddress.phone
          }
        }
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const isValid = PaymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details
    const payment = await PaymentService.getPaymentDetails(razorpay_payment_id);

    // Update order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = 'processing';
    order.paymentResult = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: payment.status === 'captured' ? 'completed' : 'failed',
      update_time: Date.now()
    };

    // If payment successful, update product stock
    if (payment.status === 'captured') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
        product.sizes[sizeIndex].stock -= item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { user: { $in: users.map(user => user._id) } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort('-createdAt');

    res.json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status and timestamps
    order.status = req.body.status;
    if (req.body.status === 'shipped') {
      order.shippedAt = Date.now();
    } else if (req.body.status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { 
        $match: { 
          'paymentResult.status': 'completed',
          status: { $ne: 'cancelled' }
        }
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalAmount' } 
        } 
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const totalUsers = await User.countDocuments();

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .populate('items.product', 'name images price')
      .sort('-createdAt')
      .limit(5);

    const topProducts = await Order.aggregate([
      { 
        $match: { 
          'paymentResult.status': 'completed',
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);

    // Populate product details
    await Product.populate(topProducts, {
      path: '_id',
      select: 'name brand price images'
    });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        totalUsers,
        pendingOrders,
        processingOrders,
        recentOrders,
        topProducts: topProducts.map(item => ({
          ...item._id.toObject(),
          unitsSold: item.unitsSold,
          revenue: item.revenue
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats'
    });
  }
}; 