const express = require('express');
const passport = require('passport');
const router = express.Router();

// Following Single Responsibility Principle - this file only handles current user routes

// Middleware to check if user is authenticated
const authenticateJWT = passport.authenticate('jwt', { session: false });

// @route   GET /auth/google/current
// @desc    Get current user
// @access  Private
router.get('/current', authenticateJWT, (req, res) => {
  try {
    // Return user data without sensitive information
    const user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      verified: req.user.verified
    };
    
    res.json(user);
  } catch (err) {
    console.error('Error getting current user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
