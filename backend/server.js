const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/shoporder', {
  useNewUrlParser: true, useUnifiedTopology: true
});

app.use('/api/shopkeepers', require('./routes/shopkeepers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => res.send('API running'));

app.listen(5000, () => console.log('Server started on 5000'));
