const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { handleMulterUpload } = require('../utils/multerConfig');
const auth = require('../middleware/auth');

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`[Event Service:Image] ===== IMAGE REQUEST STARTED =====`);
  console.log(`[Event Service:Image] Received ${req.method} request to ${req.url}`);
  console.log(`[Event Service:Image] Headers:`, req.headers);
  // Check for token in Authorization header (same as auth middleware)
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  console.log(`[Event Service:Image] Auth token present:`, !!token);
  if (token) {
    console.log(`[Event Service:Image] Token preview:`, `${token.substring(0, 10)}...`);
  } else {
    console.log(`[Event Service:Image] WARNING: No auth token in headers`);
  }
  next();
});

/**
 * @route   POST /api/events/images/:eventId
 * @desc    Upload an image for an event
 * @access  Public
 */
router.post('/:eventId', handleMulterUpload, async (req, res) => {
  console.log(`[Event Service:Image] Processing image upload for event ${req.params.eventId}`);
  // Since we removed auth middleware, we won't have req.user
  console.log(`[Event Service:Image] Authentication not required for image uploads`);
  console.log(`[Event Service:Image] File in request:`, !!req.file);
  
  try {
    console.log(`[Event Service:Image] Calling imageController.uploadEventImage`);
    await imageController.uploadEventImage(req, res);
    console.log(`[Event Service:Image] Image controller completed successfully`);
  } catch (error) {
    console.error(`[Event Service:Image] Error in image upload route:`, error);
    console.error(`[Event Service:Image] Error stack:`, error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during image upload',
      details: error.code || 'Unknown error'
    });
  } finally {
    console.log(`[Event Service:Image] ===== IMAGE REQUEST COMPLETED =====`);
  }
});

module.exports = router;
