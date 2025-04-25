const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET /api/messages/:eventId
router.get('/:eventId', messageController.getMessages);

// POST /api/messages
router.post('/', messageController.createMessage);

// PATCH /api/messages/:eventId/:messageId/delete
router.patch('/:eventId/:messageId/delete', messageController.deleteMessage);

module.exports = router;
