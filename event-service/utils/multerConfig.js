const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for S3 upload

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  console.log('Multer processing file:', file.originalname, 'mimetype:', file.mimetype);
  
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed! Received ${file.mimetype}`), false);
  }
};

// Configure multer with size limits and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only allow 1 file per request
  },
  fileFilter,
});

// Custom error handling for multer
const handleMulterUpload = (req, res, next) => {
  const multerMiddleware = upload.single('eventImage');
  
  multerMiddleware(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Error uploading file'
      });
    }
    next();
  });
};

module.exports = {
  upload,
  handleMulterUpload
};
