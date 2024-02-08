
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
const productRoutes = require('./routes/productRoutes');
//const userRoutes = require('./routes/userRoutes'); 

app.use('/products', productRoutes);
//app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
