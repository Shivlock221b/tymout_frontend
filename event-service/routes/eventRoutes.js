const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const eventValidation = [
  check('title').notEmpty().withMessage('Title is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('date').isISO8601().withMessage('Date must be a valid ISO8601 date'),
  check('location').notEmpty().withMessage('Location is required'),
  check('category').notEmpty().withMessage('Category is required')
];

const circleValidation = [
  check('name').notEmpty().withMessage('Name is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('category').notEmpty().withMessage('Category is required')
];

const memberValidation = [
  check('userId').notEmpty().withMessage('User ID is required'),
  check('name').notEmpty().withMessage('Name is required'),
  check('role').isIn(['member', 'admin']).withMessage('Role must be either member or admin')
];

const attendeeValidation = [
  check('userId').notEmpty().withMessage('User ID is required'),
  check('name').notEmpty().withMessage('Name is required')
];

// Event routes
router.post('/events', [auth, eventValidation], eventController.createEvent);
// Public routes for event details and search
router.get('/events/:id', eventController.getEvent);
router.put('/events/:id', [auth, eventValidation], eventController.updateEvent);
router.delete('/events/:id', auth, eventController.deleteEvent);
router.get('/events/host/me', auth, eventController.getHostEvents);
router.get('/events/upcoming', eventController.getUpcomingEvents);
router.get('/events/category/:category', eventController.getEventsByCategory);

// Circle routes
router.post('/circles', [auth, circleValidation], eventController.createCircle);
// Public route for circle details
router.get('/circles/:id', eventController.getCircle);
router.put('/circles/:id', [auth, circleValidation], eventController.updateCircle);
router.delete('/circles/:id', auth, eventController.deleteCircle);
router.get('/circles/creator/me', auth, eventController.getCreatorCircles);
// Public route for circle search
router.get('/circles/search', eventController.searchCircles);

// Member management routes
router.post('/circles/:id/members', [auth, memberValidation], eventController.addMember);
router.delete('/circles/:id/members', [auth, check('userId').notEmpty()], eventController.removeMember);

// Event attendance routes
router.post('/events/:id/attendees', [auth, attendeeValidation], eventController.addAttendee);
router.delete('/events/:id/attendees', [auth, check('userId').notEmpty()], eventController.removeAttendee);

module.exports = router; 