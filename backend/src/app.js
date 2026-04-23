const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: [env.frontendUrl, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API Info
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'RecipeNest API',
    version: '1.0.0',
    description: 'Complete backend API for RecipeNest application',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verifyEmail: 'POST /api/auth/verify-email',
        me: 'GET /api/auth/me'
      },
      users: {
        all: 'GET /api/users',
        chefs: 'GET /api/users/chefs',
        profile: 'GET/PUT /api/users/profile',
        stats: 'GET /api/users/stats'
      },
      recipes: {
        all: 'GET /api/recipes',
        trending: 'GET /api/recipes/trending',
        categories: 'GET /api/recipes/categories',
        single: 'GET/PUT/DELETE /api/recipes/:id',
        create: 'POST /api/recipes'
      },
      comments: {
        byRecipe: 'GET /api/comments/recipe/:recipeId',
        create: 'POST /api/comments',
        update: 'PUT /api/comments/:id',
        delete: 'DELETE /api/comments/:id'
      },
      likes: {
        toggle: 'POST /api/likes/toggle',
        check: 'GET /api/likes/check/:recipeId'
      },
      bookmarks: {
        my: 'GET /api/bookmarks/my-bookmarks',
        toggle: 'POST /api/bookmarks/toggle',
        check: 'GET /api/bookmarks/check/:recipeId'
      },
      admin: {
        stats: 'GET /api/admin/stats',
        recipes: 'GET /api/admin/recipes',
        users: 'GET /api/admin/users',
        comments: 'GET /api/admin/comments'
      }
    }
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

// 404 handler
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
  console.log(`📚 API Documentation: http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});