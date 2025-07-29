const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Login or auto-create
router.post('/login', async (req, res) => {
  const { phone, name } = req.body;
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = new Customer({ phone, name: name || "User" });
    await customer.save();
  }
  // Optionally update name if newly supplied and missing
  if (name && !customer.name) {
    customer.name = name;
    await customer.save();
  }
  res.json({ id: customer._id, name: customer.name });
});

module.exports = router;
