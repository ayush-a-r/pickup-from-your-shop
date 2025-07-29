// routes/shopkeepers.js
const express = require('express');
const router = express.Router();
const Shopkeeper = require('../models/Shopkeeper');

// Register shopkeeper
router.post('/register', async (req, res) => {
  try {
    const { phone, shopName, address } = req.body;
    const s = new Shopkeeper({ phone, shopName, address });
    await s.save();
    res.json({ id: s._id });
  } catch (e) {
    res.status(400).json({ error: 'Phone already registered or missing field' });
  }
});

// Login with phone number (no password)
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    const shop = await Shopkeeper.findOne({ phone });
    if (!shop) return res.status(404).json({ error: 'Shopkeeper not found' });
    res.json({ id: shop._id, shopName: shop.shopName });
  } catch (e) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Dropdown endpoints for addresses
router.get('/states', async (req, res) => {
  try {
    const states = await Shopkeeper.distinct('address.state');
    res.json(states);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) return res.status(400).json({ error: 'Missing state' });
    const districts = await Shopkeeper.find({ 'address.state': state }).distinct('address.district');
    res.json(districts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

router.get('/cities', async (req, res) => {
  try {
    const { state, district } = req.query;
    if (!state || !district) return res.status(400).json({ error: 'Missing state or district' });
    const cities = await Shopkeeper.find({ 'address.state': state, 'address.district': district }).distinct('address.city');
    res.json(cities);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

router.get('/localities', async (req, res) => {
  try {
    const { state, district, city } = req.query;
    if (!state || !district || !city) return res.status(400).json({ error: 'Missing state, district, or city' });
    const localities = await Shopkeeper.find({
      'address.state': state,
      'address.district': district,
      'address.city': city
    }).distinct('address.locality');
    res.json(localities);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch localities' });
  }
});

// List shops by address
router.get('/', async (req, res) => {
  try {
    const { state, district, city, locality } = req.query;
    const query = {};
    if (state) query['address.state'] = state;
    if (district) query['address.district'] = district;
    if (city) query['address.city'] = city;
    if (locality) query['address.locality'] = locality;
    const shops = await Shopkeeper.find(query);
    res.json(shops);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

module.exports = router;
