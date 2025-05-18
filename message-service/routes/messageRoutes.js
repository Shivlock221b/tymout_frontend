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

module.exports = router;
