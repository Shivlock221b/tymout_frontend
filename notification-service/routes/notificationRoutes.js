const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const notificationValidation = [
  check('title').notEmpty().withMessage('Title is required'),
  check('message').notEmpty().withMessage('Message is required'),
  check('type').isIn(['info', 'warning', 'success', 'error']).withMessage('Invalid notification type')
];

const eventNotificationValidation = [
  check('eventId').notEmpty().withMessage('Event ID is required'),
  check('type').isIn(['invitation', 'update', 'reminder', 'cancellation']).withMessage('Invalid event notification type'),
  check('eventData').optional().isObject().withMessage('Event data must be an object')
];

const circleNotificationValidation = [
  check('circleId').notEmpty().withMessage('Circle ID is required'),
  check('type').isIn(['invitation', 'update', 'reminder']).withMessage('Invalid circle notification type'),
  check('circleData').optional().isObject().withMessage('Circle data must be an object')
];

// Notification creation routes
router.post('/', [auth, notificationValidation], notificationController.createNotification);
router.post('/event', [auth, eventNotificationValidation], notificationController.createEventNotification);
router.post('/circle', [auth, circleNotificationValidation], notificationController.createCircleNotification);

// Notification retrieval routes
router.get('/', auth, notificationController.getNotifications);
router.get('/unread/count', auth, notificationController.getUnreadCount);

// Notification update routes
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/read/all', auth, notificationController.markAllAsRead);

// Notification delivery routes
router.post('/:notificationId/email', auth, notificationController.sendEmailNotification);
router.post('/:notificationId/push', auth, notificationController.sendPushNotification);

module.exports = router; 