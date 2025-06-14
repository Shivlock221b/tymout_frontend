const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Please include a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  check('email').isEmail().withMessage('Please include a valid email'),
  check('password').exists().withMessage('Password is required')
];

const updateProfileValidation = [
  check('name').optional().notEmpty().withMessage('Name cannot be empty'),
  check('email').optional().isEmail().withMessage('Please include a valid email')
];

const preferencesValidation = [
  check('notifications').optional().isBoolean().withMessage('Notifications must be a boolean'),
  check('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be either light or dark')
];

// Authentication routes
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/refresh-token', userController.refreshToken);

// Protected routes
router.get('/me', auth, userController.getCurrentUser);
router.put('/profile', [auth, updateProfileValidation], userController.updateProfile);
router.get('/preferences', auth, userController.getUserPreferences);
router.put('/preferences', [auth, preferencesValidation], userController.updateUserPreferences);

module.exports = router; 