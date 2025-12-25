// dbConnect.js
const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string in process.env.MONGO_URI
 * @returns {Promise<boolean>} true if connection is successful
 */
async function connectToDatabase() {
  const mongoDB = process.env.MONGO_URI;
  if (!mongoDB) {
    console.error("MongoDB connection string not found in environment variables.");
    return false;
  }

  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB connected successfully!");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
}

module.exports = connectToDatabase;
