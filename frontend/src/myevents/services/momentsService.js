// momentsService.js
// Service for fetching and uploading event moments/photos from backend API
import axios from 'axios';

// Configure axios to connect directly to the event service
const eventServiceClient = axios.create({
  baseURL: process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002',
  timeout: 30000 // Longer timeout for image uploads
  // No default Content-Type header - will be set automatically based on the request
});

// Intercept requests to add auth token
eventServiceClient.interceptors.request.use(
  config => {
    // Extract token from 'auth-storage' in localStorage
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      } catch (e) {
        // Optionally log error
      }
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * Get event moments/photos
 * @param {string} eventId - The event ID
 * @returns {Promise<Array>} - Array of photo URLs
 */
export async function getEventMoments(eventId) {
  try {
    if (!eventId) {
      console.error('Event ID not provided for fetching moments/photos');
      return [];
    }
    
    console.log('Fetching moments/photos for event:', eventId);
    const response = await eventServiceClient.get(`/events/${eventId}/photos`);
    
    // Log the response for debugging
    console.log('Event photos response:', response.data);
    
    // Return the photos from the event data
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching photos for event ${eventId}:`, error);
    return [];
  }
}

/**
 * Upload moment/photo to an event
 * @param {string} eventId - The event ID
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Response with the uploaded image URL
 */
export async function uploadEventMoment(eventId, imageFile) {
  try {
    if (!eventId || !imageFile) {
      throw new Error('Event ID and image file are required');
    }
    
    console.log('Uploading moment/photo for event:', eventId, 'file:', imageFile.name, 'type:', imageFile.type, 'size:', imageFile.size);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('momentImage', imageFile, imageFile.name);
    
    // Log FormData contents for debugging
    console.log('FormData created with file:', imageFile.name);
    
    // Important: Do NOT set Content-Type header manually
    // Let axios set it automatically with the correct boundary for multipart/form-data
    const config = {
      headers: {
        // Explicitly remove Content-Type to let browser set it with boundary
        'Content-Type': undefined
      }
    };
    
    // Make API call to upload the image
    console.log(`Making POST request to: /events/images/${eventId}/moments`);
    const response = await eventServiceClient.post(`/events/images/${eventId}/moments`, formData, config);
    console.log('Upload moment response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading moment for event ${eventId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}
