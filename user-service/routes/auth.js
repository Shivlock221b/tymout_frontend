const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`[User Service:Step 1] Received ${req.method} request to ${req.url}`);
  console.log(`[User Service:Step 2] Headers:`, req.headers);
  console.log(`[User Service:Step 3] Body:`, req.body);
  next();
});

// @route   POST /auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  userController.register
);

// @route   POST /auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  userController.login
);

// @route   GET /auth/current
// @desc    Get current user
// @access  Private
router.get('/current', auth, userController.getCurrentUser);

module.exports = router;
