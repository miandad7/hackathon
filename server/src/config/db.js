const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citizen_complaint_portal';
  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Primary MongoDB connection failed (${error.message}). Attempting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoMemoryServer Connected: ${memoryUri}`);
    } catch (memError) {
      console.error(`MongoMemoryServer Fallback Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
