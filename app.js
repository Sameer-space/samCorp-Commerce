const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
require('dotenv').config();


// Set up middleware (body parser, helmet, etc.)
app.use(express.json());
app.use(helmet()); 
app.use(cors());

// Connect to MongoDB
const mongoose = require('mongoose');
const db = require('./db'); 
db.connect();

// Set Up Swagger Docs
const docs =  require('./docs');
docs.setupSwagger(app);

// Set up routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const discountRoutes = require('./routes/discountRoutes');
const deliveryMethodRoutes = require('./routes/deliveryMethodRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use('/users', userRoutes);
app.use('/admin', adminRoutes); // Set up admin routes
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/discounts', discountRoutes);
app.use('/delivery', deliveryMethodRoutes);
app.use('/payment', paymentMethodRoutes);
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 3000;
const logWithLink = (port) => {
  const link = `http://localhost:${port}`;
  return `\u001b[1mServer is running on port \u001b[36m${port}\u001b[39m - \u001b[4m\u001b[32m${link}\u001b[0m`;
};

app.listen(PORT, () => {
  console.log(logWithLink(PORT));
});
