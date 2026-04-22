const mongoose = require('mongoose');
const { env } = require('./env');

const connectDB = async () => {
  // Check if DATABASE_URL is provided and not empty
  if (!env.databaseUrl || env.databaseUrl === '') {
    console.log('⚠️ DATABASE_URL not provided in .env file');
    console.log('💡 To use MongoDB, add DATABASE_URL to .env file');
    console.log('📝 Example: DATABASE_URL=mongodb://localhost:27017/recipenest');
    console.log('🚀 Starting server without database connection...');
    return null;
  }

  try {
    // Remove deprecated options for Mongoose v8+
    const conn = await mongoose.connect(env.databaseUrl);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📀 Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('🚀 Starting server without database connection...');
    return null;
  }
};

module.exports = connectDB;