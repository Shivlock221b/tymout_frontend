const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { handleMulterUpload } = require('../utils/multerConfig');

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`[User Service:Step 1] Received ${req.method} request to ${req.url}`);
  console.log(`[User Service:Step 2] Headers:`, req.headers);
  console.log(`[User Service:Step 3] Body:`, req.body);
  next();
});

// @route   GET /user/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   GET /user/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', userController.getUserById);

// @route   PUT /user/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('bio', 'Bio cannot exceed 500 characters').isLength({ max: 500 }),
      body('interests', 'Interests must be an array').isArray()
    ]
  ],
  userController.updateProfile
);

// @route   POST /user/profile/image
// @desc    Upload profile image
// @access  Private
router.post(
  '/profile/image',
  auth,
  handleMulterUpload, // Use our custom multer handler with better error handling
  userController.uploadProfileImage
);

// @route   GET /user/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  console.log('[User Service] Received request for /preferences');
  console.log('[User Service] User ID:', req.user.id);
  console.log('[User Service] Auth token:', req.header('Authorization'));
  await userController.getUserPreferences(req, res);
});

// @route   PUT /user/preferences
// @desc    Update user preferences
// @access  Private
router.put(
  '/preferences',
  [
    auth,
    [
      body('notifications', 'Notifications settings are required').isObject(),
      body('privacy', 'Privacy settings are required').isObject(),
      body('theme', 'Theme is required').isString()
    ]
  ],
  userController.updateUserPreferences
);

module.exports = router;
