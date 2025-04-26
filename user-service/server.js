const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Following Single Responsibility Principle - server.js only handles server setup
const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

// MongoDB connection - using the connection string from our project
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tymout:xShiTOyopWJvVYWn@tymout.2ovsdf2.mongodb.net/tymout';

// Session configuration
app.use(
  session({
    secret: process.env.COOKIE_KEY || 'tymout_cookie_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3010',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet()); // Security headers
app.use(express.json());
app.use(morgan('dev')); // Logging

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import Passport config
require('./config/passport');

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB - User Service');
    console.log('MongoDB Connection URI:', MONGO_URI.replace(/:[^:]*@/, ':****@')); // Hide password in logs
    
    // List all collections in the database
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listing collections:', err);
      } else {
        console.log('Available collections:', collections.map(c => c.name));
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Add test endpoint before other routes
app.get('/test', (req, res) => {
  console.log(`[User Service:Server] Test endpoint hit`);
  res.json({ message: 'User Service is running', timestamp: new Date().toISOString() });
});

// Import routes - following SRP by separating route handling
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const googleAuthRoutes = require('./routes/googleAuth');
const currentUserRoutes = require('./routes/currentUser');

// Health check endpoint for Railway deployment
app.get('/health', (req, res) => {
  console.log('[User Service:Server] Health check requested');
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

app.get('/auth/health', (req, res) => {
  console.log('[User Service:Server] Auth health check requested');
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

// Add request logging middleware before routes
app.use((req, res, next) => {
  console.log(`[User Service:Server] Received ${req.method} request to ${req.url}`);
  console.log(`[User Service:Server] Request headers:`, req.headers);
  console.log(`[User Service:Server] Request body:`, req.body);
  next();
});

// Use routes with paths that match frontend expectations
console.log(`[User Service:Server] Registering routes...`);
app.use('/auth/oauth', googleAuthRoutes);
app.use('/auth/google', googleAuthRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
// app.use('/auth', currentUserRoutes); // This makes /auth/current accessible

// Map the OAuth verification endpoint explicitly to match frontend expectations
// app.use('/auth', require('./routes/googleAuth')); // This ensures /auth/oauth/verify is registered

// Log all registered routes for debugging
console.log('[User Service:Server] Registered routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`[User Service:Server] ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = handler.route.methods;
        Object.keys(methods).forEach(method => {
          console.log(`[User Service:Server] ${method.toUpperCase()} ${path}`);
        });
      }
    });
  }
});

// Test route to verify API Gateway routing
app.get('/test-db', async (req, res) => {
  try {
    // Import User model
    const User = require('./models/User');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Create a test user
    const testUser = new User({
      googleId: `test-${Date.now()}`,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      profilePicture: 'https://example.com/test.jpg',
      verified: true
    });
    
    // Save the test user
    const savedUser = await testUser.save();
    console.log('Test user created:', savedUser._id);
    
    // Count users
    const userCount = await User.countDocuments();
    
    res.json({
      message: 'Database test successful',
      collections: collections.map(c => c.name),
      testUser: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      },
      userCount
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(`[User Service:Server] Error:`, err);
  console.error(`[User Service:Server] Error details:`, {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  res.status(500).json({ error: 'Server error', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`[User Service:Server] Server running on port ${PORT}`);
  console.log(`[User Service:Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
