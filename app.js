const express = require('express');
const helmet = require('helmet');
const app = express();
require('dotenv').config();

// Set up middleware (body parser, helmet, etc.)
app.use(express.json());
app.use(helmet()); 

// Connect to MongoDB
const mongoose = require('mongoose');
const db = require('./db'); 
db.connect();

// Set up routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

app.use('/users', userRoutes);
app.use('/admin', adminRoutes); // Set up admin routes
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

const PORT = process.env.PORT || 3000;
const logWithLink = (port) => {
  const link = `http://localhost:${port}`;
  return `\u001b[1mServer is running on port \u001b[36m${port}\u001b[39m - \u001b[4m\u001b[32m${link}\u001b[0m`;
};

app.listen(PORT, () => {
  console.log(logWithLink(PORT));
});
