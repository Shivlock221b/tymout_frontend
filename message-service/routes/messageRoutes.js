const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET /api/messages/chat-preview/:eventId - Get chat preview with unread count
router.get('/chat-preview/:eventId', messageController.getChatPreview);

// GET /api/messages/:eventId
router.get('/:eventId', messageController.getMessages);

// POST /api/messages
router.post('/', messageController.createMessage);

// PATCH /api/messages/:eventId/:messageId/delete
router.patch('/:eventId/:messageId/delete', messageController.deleteMessage);

// POST /api/messages/:eventId/read - Mark all messages in an event as read by a user
router.post('/:eventId/read', messageController.markMessagesAsRead);

module.exports = router;
