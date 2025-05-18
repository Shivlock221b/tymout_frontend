const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

// Configure AWS SDK with credentials from .env file
const BUCKET_NAME = process.env.BUCKET_NAME || 'tymouttest';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// Configure AWS with credentials from .env
AWS.config.update({
  region: REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

// Create an S3 key for the file
const createS3Key = (directory, filename) => {
  return `${directory}/${filename}`;
};

// Get the public URL for an S3 object
const getS3ImageUrl = (key, bucket = BUCKET_NAME) => {
  return `https://${bucket}.s3.${REGION}.amazonaws.com/${key}`;
};

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalFilename - Original filename
 * @param {string} eventId - Event ID for creating a unique path
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
const uploadFileToS3 = async (fileBuffer, originalFilename, eventId) => {
  try {
    // Generate a unique filename with original extension
    const fileExtension = originalFilename.split('.').pop().toLowerCase();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Create directory path
    const directory = `events/${eventId}/images`;
    
    // Create S3 key
    const s3Key = createS3Key(directory, uniqueFilename);
    
    // Set up the S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
      ACL: 'public-read' // Make the file publicly accessible
    };
    
    // Upload the file to S3
    await s3.upload(params).promise();
    
    // Return the S3 URL
    return getS3ImageUrl(s3Key);
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

module.exports = {
  uploadFileToS3,
  createS3Key,
  getS3ImageUrl,
  BUCKET_NAME,
  REGION
};
