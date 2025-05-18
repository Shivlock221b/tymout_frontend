const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Following Single Responsibility Principle - this file only handles Google authentication routes

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'tymout_jwt_secret_key_change_in_production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

// @route   GET /auth/google
// @desc    Authenticate with Google
// @access  Public
router.get(
  '/',
  (req, res, next) => {
    console.log('Google auth route accessed');
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    accessType: 'offline'
  })
);

// @route   GET /auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
  '/callback',
  (req, res, next) => {
    console.log('Google auth callback route accessed');
    console.log('Query parameters:', req.query);
    next();
  },
  (req, res, next) => {
    // Custom error handler for Passport authentication
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google authentication error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=auth_error&message=${encodeURIComponent(err.message)}`);
      }
      
      if (!user) {
        console.error('Authentication failed:', info);
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }
      
      // Authentication successful, set user in request object
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('Google auth callback successful');
      console.log('User authenticated:', req.user ? req.user.id : 'No user');
      
      if (!req.user) {
        console.error('No user found after authentication');
        return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
      }

      // Create access token with user ID
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Create refresh token with longer expiration
      const refreshToken = jwt.sign(
        { id: req.user.id, tokenType: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('JWT tokens created, redirecting to frontend');
      
      // Redirect to frontend with both tokens
      res.redirect(`${FRONTEND_URL}/auth/success?token=${token}&refreshToken=${refreshToken}`);
    } catch (err) {
      console.error('Error in Google callback:', err);
      res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

// @route   GET /auth/oauth/verify
// @desc    Verify OAuth token and return user data
// @access  Public
router.get('/verify', async (req, res) => {
  try {
    console.log('OAuth verification endpoint accessed');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No token provided or invalid format');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Token extraction failed');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    console.log('Verifying token...');
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user ID:', decoded.id);
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('User not found for ID:', decoded.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found, returning user data');
    // Return user without sensitive information
    const { password, ...userWithoutPassword } = user.toObject();
    return res.json(userWithoutPassword);
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// @route   GET /auth/google/current
// @desc    Get current user from Google auth
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    // Return user without sensitive information
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error getting current user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
