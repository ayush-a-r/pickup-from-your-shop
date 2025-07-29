const mongoose = require('mongoose');
const CustomerSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String
});
module.exports = mongoose.model('Customer', CustomerSchema);
