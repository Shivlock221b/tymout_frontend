const { uploadFileToS3 } = require('../utils/s3Upload');
const Event = require('../models/Event');

class ImageController {
  /**
   * Upload event image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadEventImage(req, res) {
    try {
      console.log('=== [Image Controller] START IMAGE UPLOAD PROCESS ===');
      console.log('[Image Controller] Processing event image upload');
      console.log('[Image Controller] Request params:', req.params);
      console.log('[Image Controller] Request user:', req.user);
      console.log('[Image Controller] Headers:', req.headers);
      
      if (!req.file) {
        console.error('[Image Controller] No file received in request');
        console.log('[Image Controller] Request body:', req.body);
        console.log('[Image Controller] Files object:', req.files);
        return res.status(400).json({
          success: false,
          error: 'No image file was provided'
        });
      }
      
      console.log(`[Image Controller] File received: ${req.file.originalname}, size: ${req.file.size} bytes, mimetype: ${req.file.mimetype}`);
      console.log('[Image Controller] File buffer size:', req.file.buffer ? req.file.buffer.length : 'No buffer');
      
      // Extract eventId from request body or params
      const eventId = req.params.eventId || req.body.eventId;
      
      console.log(`[Image Controller] Event ID from request: ${eventId}`);
      
      if (!eventId) {
        console.error('[Image Controller] Event ID is missing');
        return res.status(400).json({
          success: false,
          error: 'Event ID is required'
        });
      }
      
      console.log(`[Image Controller] Attempting to upload file to S3 for event: ${eventId}`);
      
      try {
        // Upload file to S3
        const imageUrl = await uploadFileToS3(
          req.file.buffer,
          req.file.originalname,
          eventId
        );
        
        console.log(`[Image Controller] Image uploaded successfully to S3: ${imageUrl}`);
        
        // Send success response
        const responseData = {
          success: true,
          message: 'Event image uploaded successfully',
          data: {
            imageUrl
          }
        };
        
        console.log(`[Image Controller] Sending success response:`, responseData);
        res.status(200).json(responseData);
      } catch (s3Error) {
        console.error('[Image Controller] S3 upload error:', s3Error);
        return res.status(500).json({
          success: false,
          error: `S3 upload failed: ${s3Error.message}`
        });
      }
    } catch (error) {
      console.error('[Image Controller] Error uploading event image:', error);
      console.error('[Image Controller] Error stack:', error.stack);
      
      const errorResponse = {
        success: false,
        error: error.message || 'Error uploading event image',
        details: error.code || 'Unknown error code'
      };
      
      console.error('[Image Controller] Sending error response:', errorResponse);
      res.status(500).json(errorResponse);
      console.log('=== [Image Controller] END IMAGE UPLOAD PROCESS (ERROR) ===');
    }
  }

  /**
   * Upload a moment image for an event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadEventMoment(req, res) {
    try {
      console.log('=== [Image Controller] START MOMENT UPLOAD PROCESS ===');
      console.log('[Image Controller] Processing event moment upload');
      console.log('[Image Controller] Request params:', req.params);
      console.log('[Image Controller] Request user:', req.user ? req.user.id : 'No user');
      
      if (!req.file) {
        console.error('[Image Controller] No moment file received in request');
        return res.status(400).json({
          success: false,
          error: 'No moment image file was provided'
        });
      }
      
      console.log(`[Image Controller] Moment file received: ${req.file.originalname}, size: ${req.file.size} bytes`);
      
      // Extract eventId from request params
      const eventId = req.params.eventId;
      
      if (!eventId) {
        console.error('[Image Controller] Event ID is missing');
        return res.status(400).json({
          success: false,
          error: 'Event ID is required'
        });
      }
      
      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        console.error(`[Image Controller] Event with ID ${eventId} not found`);
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      console.log(`[Image Controller] Uploading moment to S3 for event: ${eventId}`);
      
      // Upload file to S3
      const imageUrl = await uploadFileToS3(
        req.file.buffer,
        req.file.originalname,
        `${eventId}/moments`
      );
      
      console.log(`[Image Controller] Moment image uploaded to S3: ${imageUrl}`);
      
      // Create media object to add to event
      const mediaObject = {
        type: 'image',
        url: imageUrl,
        caption: req.body.caption || '',
        reaction: []
      };
      
      // Add media to event
      console.log(`[Image Controller] Adding media to event document`);
      event.media.push(mediaObject);
      await event.save();
      
      console.log(`[Image Controller] Event document updated with new media`);
      
      // Send success response
      const responseData = {
        success: true,
        message: 'Moment image uploaded successfully',
        data: {
          imageUrl,
          media: mediaObject
        }
      };
      
      console.log(`[Image Controller] Sending success response`);
      res.status(200).json(responseData);
      console.log('=== [Image Controller] END MOMENT UPLOAD PROCESS (SUCCESS) ===');
    } catch (error) {
      console.error('[Image Controller] Error uploading moment image:', error);
      console.error('[Image Controller] Error stack:', error.stack);
      
      const errorResponse = {
        success: false,
        error: error.message || 'Error uploading moment image',
        details: error.code || 'Unknown error code'
      };
      
      console.error('[Image Controller] Sending error response:', errorResponse);
      res.status(500).json(errorResponse);
      console.log('=== [Image Controller] END MOMENT UPLOAD PROCESS (ERROR) ===');
    }
  }
}

module.exports = new ImageController();
