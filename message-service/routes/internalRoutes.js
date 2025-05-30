const express = require('express');
const router = express.Router();

// Import socket.io instance (we'll need to modify server.js to expose this)
let io;

// Set the io instance from server.js
const setIo = (ioInstance) => {
  io = ioInstance;
};

// POST /api/internal/notify - Internal endpoint for cross-service notifications
router.post('/notify', (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and data'
      });
    }
    
    console.log(`[Internal Routes] Received notification of type ${type}:`, data);
    
    // Handle different notification types
    switch (type) {
      case 'attendeeStatusChanged':
        // Emit socket event for attendee status change
        console.log(`[Internal Routes] Processing attendeeStatusChanged notification with data:`, JSON.stringify(data));
        
        if (io) {
          console.log(`[Internal Routes] Socket.io instance is available, emitting event to ${io.engine?.clientsCount || 'unknown'} clients`);
          io.emit('attendeeStatusUpdated', data);
          console.log(`[Internal Routes] Emitted attendeeStatusUpdated event`);
        } else {
          console.error('[Internal Routes] Socket.io instance not available');
        }
        break;
        
      default:
        console.warn(`[Internal Routes] Unknown notification type: ${type}`);
    }
    
    res.status(200).json({
      success: true,
      message: `Notification of type ${type} processed successfully`
    });
  } catch (error) {
    console.error('[Internal Routes] Error processing notification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = { router, setIo };
