const mongoose = require('mongoose');

async function connect() {
  try {
    const atlasUri = process.env.MONGODB_URI; // Replace with your MongoDB Atlas connection string
    
    const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(atlasUri, clientOptions);

    console.log('Connected to MongoDB Atlas');

    // Optionally, ping the deployment to verify the connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You are successfully connected to MongoDB!");
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }

  // Handling MongoDB connection errors
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
}

module.exports = { connect };
