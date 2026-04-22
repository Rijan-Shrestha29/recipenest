const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const connectDB = require('./config/database');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to RecipeNest API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler - FIXED: Use (req, res) instead of '*'
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
const PORT = env.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend URL: ${env.frontendUrl}`);
});