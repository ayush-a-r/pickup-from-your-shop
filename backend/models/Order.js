const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  name: String,
  company: String,
  quantity: String
});
const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  shopkeeperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
  items: [ItemSchema],
  pickupTime: String,
  status: { type: String, enum: ['pending', 'cancelled', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);
