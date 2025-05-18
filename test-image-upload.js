/**
 * Test script to verify image upload functionality
 * 
 * This script tests the complete flow:
 * 1. Login to get an auth token
 * 2. Upload an image file to the user service
 * 3. Verify the S3 URL is saved in the user profile
 */
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || `http://localhost:${process.env.USER_SERVICE_PORT || 3001}`;
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg'); // Make sure this file exists
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Create a test image if it doesn't exist
const createTestImage = () => {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creating test image...');
    // Create a simple 100x100 pixel image
    const Canvas = require('canvas');
    const canvas = Canvas.createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    // Draw a gradient
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1, '#0000ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Test Image', 10, 50);
    
    // Save to file
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(TEST_IMAGE_PATH, buffer);
    console.log('Test image created at:', TEST_IMAGE_PATH);
  }
};

// Main test function
async function testImageUpload() {
  try {
    console.log('Starting image upload test...');
    
    // Step 1: Login to get auth token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/auth/login`, TEST_USER);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const { token, user } = loginResponse.data.data;
    console.log('Login successful. User ID:', user._id);
    
    // Step 2: Upload image
    console.log('Step 2: Uploading image...');
    const formData = new FormData();
    formData.append('profileImage', fs.createReadStream(TEST_IMAGE_PATH));
    
    const uploadResponse = await axios.post(
      `${USER_SERVICE_URL}/user/profile/image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!uploadResponse.data.success) {
      throw new Error('Image upload failed');
    }
    
    const { profileImage } = uploadResponse.data.data;
    console.log('Image upload successful. Profile image URL:', profileImage);
    
    // Step 3: Verify user profile has the image URL
    console.log('Step 3: Verifying user profile...');
    const profileResponse = await axios.get(
      `${USER_SERVICE_URL}/user/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!profileResponse.data.success) {
      throw new Error('Failed to get user profile');
    }
    
    const updatedUser = profileResponse.data.data;
    
    if (updatedUser.profileImage === profileImage) {
      console.log('✅ TEST PASSED: Profile image URL is correctly saved in the user profile');
      console.log('Profile image URL:', updatedUser.profileImage);
    } else {
      console.log('❌ TEST FAILED: Profile image URL in user profile does not match the uploaded image URL');
      console.log('Expected:', profileImage);
      console.log('Actual:', updatedUser.profileImage);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
createTestImage();
testImageUpload();
