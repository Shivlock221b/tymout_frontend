const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const experienceController = require('../controllers/experienceController');

/**
 * Experience Routes
 * All routes are prefixed with /experiences
 */

// Get all experiences with filtering and pagination
router.get('/', experienceController.getAllExperiences);

// Search experiences
router.get('/search', experienceController.searchExperiences);

// Get nearby experiences based on geolocation
router.get('/nearby', experienceController.getNearbyExperiences);

// Get experiences by host ID
router.get('/host/:hostId', experienceController.getExperiencesByHost);

// Get experience by ID
router.get('/:id', experienceController.getExperienceById);

// Create new experience
router.post('/', [
  // Validation rules
  check('title').notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  check('description').notEmpty().withMessage('Description is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('price').notEmpty().withMessage('Price is required').isNumeric().withMessage('Price must be a number'),
  check('location.place').notEmpty().withMessage('Location place is required'),
  check('location.address').notEmpty().withMessage('Location address is required'),
  check('location.city').notEmpty().withMessage('Location city is required'),
  check('location.country').notEmpty().withMessage('Location country is required'),
  check('location.coordinates.coordinates').isArray().withMessage('Coordinates must be an array'),
  check('host.id').notEmpty().withMessage('Host ID is required'),
  check('host.name').notEmpty().withMessage('Host name is required')
], experienceController.createExperience);

// Update experience
router.put('/:id', [
  // Validation rules for update (less strict than create)
  check('title').optional().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  check('price').optional().isNumeric().withMessage('Price must be a number'),
  check('location.coordinates.coordinates').optional().isArray().withMessage('Coordinates must be an array')
], experienceController.updateExperience);

// Delete experience
router.delete('/:id', experienceController.deleteExperience);

// Add review to experience
router.post('/:id/reviews', [
  check('userId').notEmpty().withMessage('User ID is required'),
  check('userName').notEmpty().withMessage('User name is required'),
  check('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], experienceController.addReview);

// Add table to experience
router.post('/:id/tables', [
  check('tableNumber').notEmpty().withMessage('Table number is required'),
  check('capacity').notEmpty().withMessage('Capacity is required').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], experienceController.addTable);

// Get available tables for an experience
router.get('/:id/tables', experienceController.getAvailableTables);

module.exports = router;
