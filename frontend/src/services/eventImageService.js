import axios from 'axios';

/**
 * Service for handling event image uploads
 * Following Single Responsibility Principle - this service only handles event image operations
 */
const API_URL = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'; // Event service URL

/**
 * Upload an event image
 * @param {File} imageFile - The image file to upload
 * @param {string} eventId - The ID of the event
 * @param {string} token - JWT authentication token
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadEventImage = async (imageFile, eventId, token) => {
  try {
    console.log(`[Event Image Service] Starting image upload process for event ${eventId}`);
    console.log(`[Event Image Service] Image file:`, imageFile ? { name: imageFile.name, type: imageFile.type, size: imageFile.size } : 'No file');
    console.log(`[Event Image Service] Event ID: ${eventId}`);
    
    if (!imageFile || !eventId) {
      console.error('[Event Image Service] Missing required parameters');
      throw new Error('Image file and event ID are required');
    }

    if (!token) {
      console.warn('[Event Image Service] No authentication token provided!');
      // Try to get token from localStorage if not provided
      token = localStorage.getItem('token');
      console.log('[Event Image Service] Retrieved token from localStorage:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        console.error('[Event Image Service] Authentication token is missing');
        throw new Error('Authentication token is required for image upload');
      }
    }

    console.log(`[Event Image Service] Uploading image for event ${eventId} with token: ${token.substring(0, 10)}...`);
    console.log(`[Event Image Service] API URL: ${API_URL}/events/images/${eventId}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('eventImage', imageFile);
    
    // Create a fresh axios instance to avoid Content-Type header issues
    const axiosInstance = axios.create();
    
    // Make the request with proper headers
    // Make sure the token is in the correct format for the Authorization header
    // If it doesn't start with 'Bearer ', add it
    let authToken = token;
    if (token && !token.startsWith('Bearer ')) {
      authToken = `Bearer ${token}`;
      console.log('[Event Image Service] Added Bearer prefix to token');
    }
    
    console.log('[Event Image Service] Sending image upload request with headers:', {
      'Authorization': authToken ? `${authToken.substring(0, 15)}...` : 'missing',
      'Content-Type': 'multipart/form-data (will be set by axios with boundary)'
    });
    
    try {
      const response = await axiosInstance.post(
        `${API_URL}/events/images/${eventId}`,
        formData,
        {
          headers: {
            'Authorization': authToken,
            // Don't set Content-Type here, axios will set it correctly with boundary
          }
        }
      );
      
      console.log('[Event Image Service] Image upload response status:', response.status);
      console.log('[Event Image Service] Image upload response data:', response.data);
      
      if (response.data.success && response.data.data && response.data.data.imageUrl) {
        console.log('[Event Image Service] Successfully uploaded image, URL:', response.data.data.imageUrl);
        return response.data.data.imageUrl;
      } else {
        console.error('[Event Image Service] Upload succeeded but response format is unexpected:', response.data);
        throw new Error(response.data.error || 'Failed to upload image: Invalid response format');
      }
    } catch (requestError) {
      console.error('[Event Image Service] Request error during image upload:', requestError);
      console.error('[Event Image Service] Error response:', requestError.response ? requestError.response.data : 'No response data');
      throw requestError;
    }
  } catch (error) {
    console.error('[Event Image Service] Error uploading event image:', error);
    console.error('[Event Image Service] Error details:', error.message);
    if (error.response) {
      console.error('[Event Image Service] Response status:', error.response.status);
      console.error('[Event Image Service] Response data:', error.response.data);
    }
    throw error;
  }
};

export default {
  uploadEventImage
};
