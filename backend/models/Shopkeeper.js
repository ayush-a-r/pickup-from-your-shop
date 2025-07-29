// models/Shopkeeper.js
const mongoose = require('mongoose');

const ShopkeeperSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  shopName: { type: String, required: true },
  address: {
    state: { type: String },
    district: { type: String },
    city: { type: String },
    locality: { type: String }
  }
  // add other fields if needed
});

// Export the MODEL, not just the schema!
module.exports = mongoose.model('Shopkeeper', ShopkeeperSchema);
