const mongoose = require('mongoose');

function connect() {
  const atlasUri = process.env.MONGODB_URI; // Replace with your MongoDB Atlas connection string

  mongoose.connect(atlasUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
  });
}

module.exports = { connect };
