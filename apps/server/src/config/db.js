const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/contentkitai';
    
    // In development mode, check if port 27017 is listening.
    // If not, auto-spin up the in-memory MongoDB Server for zero-friction local development.
    if (process.env.NODE_ENV === 'development') {
      const net = require('net');
      const isPortActive = await new Promise((resolve) => {
        const client = new net.Socket();
        client.setTimeout(1000);
        client.connect(27017, '127.0.0.1', () => {
          client.end();
          resolve(true);
        });
        client.on('error', () => {
          resolve(false);
        });
        client.on('timeout', () => {
          client.destroy();
          resolve(false);
        });
      });

      if (!isPortActive) {
        console.log('◇ No local MongoDB instance detected on port 27017.');
        console.log('◇ Spinning up mongodb-memory-server process...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        connectionString = mongoServer.getUri();
      }
    }

    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
