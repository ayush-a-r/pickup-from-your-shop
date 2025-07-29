const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// Unique order number generator
function generateOrderNumber() {
  return 'ORD' + Math.random().toString().slice(2, 10);
}

// Place new order (customerId required)
router.post('/', async (req, res) => {
  const { customerId, shopkeeperId, items, pickupTime } = req.body;
  const orderNumber = generateOrderNumber();
  const order = new Order({ orderNumber, customerId, shopkeeperId, items, pickupTime });
  await order.save();
  res.json(order);
});

// List orders for a customer
router.get('/customer/:customerId', async (req, res) => {
  const orders = await Order.find({ customerId: req.params.customerId })
    .populate('shopkeeperId');
  res.json(orders);
});

// Customer cancels order
router.post('/:orderId/cancel', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).end();
  order.status = 'cancelled';
  await order.save();
  // Delete customer if no pending orders
  const active = await Order.countDocuments({ customerId: order.customerId, status: 'pending' });
  if (active === 0) await Customer.findByIdAndDelete(order.customerId);
  res.sendStatus(200);
});

// Shopkeeper: list all pending
router.get('/shopkeeper/:id', async (req, res) => {
  const orders = await Order.find({
    shopkeeperId: req.params.id,
    status: 'pending'
  }).sort({ pickupTime: 1 }).populate('customerId');
  res.json(orders);
});

// Shopkeeper completes order
router.post('/:orderId/complete', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).end();
  order.status = 'completed';
  await order.save();
  // Delete customer if no pending orders
  const active = await Order.countDocuments({ customerId: order.customerId, status: 'pending' });
  if (active === 0) await Customer.findByIdAndDelete(order.customerId);
  res.sendStatus(200);
});

// Shopkeeper: order statistics
router.get('/statistics/:shopId', async (req, res) => {
  const total = await Order.countDocuments({
    shopkeeperId: req.params.shopId,
    status: { $in: ['pending', 'completed'] }
  });
  const completed = await Order.countDocuments({
    shopkeeperId: req.params.shopId,
    status: 'completed'
  });
  res.json({ totalOrders: total, completedOrders: completed });
});

module.exports = router;
