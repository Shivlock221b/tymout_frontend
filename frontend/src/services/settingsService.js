/**
 * Settings Service
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all settings-related API calls
 * - Each function handles a specific settings operation
 */
import axios from 'axios';

// Configure axios client for user service
const userServiceClient = axios.create({
  baseURL: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001', // User service runs on port 3001
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add auth token
userServiceClient.interceptors.request.use(
  config => {
    console.log('API Request Config:', { url: config.url, method: config.method });
    
    // Extract token from 'auth-storage' in localStorage
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
        console.log('Found auth token:', token ? 'Token exists' : 'No token');
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    } else {
      console.warn('No auth-storage found in localStorage');
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No token available for request authentication');
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

const settingsService = {
  /**
   * Update profile settings
   * @param {Object} profileData - Profile settings data
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfileSettings: async (profileData) => {
    try {
      console.log('Calling updateProfileSettings with data:', profileData);
      
      // Make a real API call to update profile settings
      // The correct endpoint is /user/profile based on server.js configuration
      const response = await userServiceClient.put('/user/profile', profileData);
      
      console.log('Profile update API response:', response);
      console.log('Profile update response data:', response.data);
      
      // Store updated profile data in localStorage for immediate access
      // This ensures the data persists even if the page is refreshed
      try {
        const currentUser = JSON.parse(localStorage.getItem('user-data') || '{}');
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('user-data', JSON.stringify(updatedUser));
        console.log('Updated user data in localStorage');
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating profile settings:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Update account settings
   * @param {Object} accountData - Account settings data
   * @returns {Promise<Object>} Updated account data
   */
  updateAccountSettings: async (accountData) => {
    try {
      // Make a real API call to update account settings
      const response = await userServiceClient.put('/user/account', accountData);
      console.log('Account update response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating account settings:', error);
      throw error;
    }
  },
  
  /**
   * Update privacy settings
   * @param {Object} privacyData - Privacy settings data
   * @returns {Promise<Object>} Updated privacy data
   */
  updatePrivacySettings: async (privacyData) => {
    try {
      // Make a real API call to update privacy settings
      const response = await userServiceClient.put('/user/preferences', privacyData);
      console.log('Privacy update response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  },
  
  /**
   * Update notification settings
   * @param {Object} notificationData - Notification settings data
   * @returns {Promise<Object>} Updated notification data
   */
  updateNotificationSettings: async (notificationData) => {
    try {
      // Make a real API call to update notification settings
      const response = await userServiceClient.put('/user/preferences', notificationData);
      console.log('Notification update response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },
  
  /**
   * Upload profile image
   * @param {File} imageFile - The image file to upload
   * @returns {Promise<Object>} Updated user data with profile image URL
   */
  uploadProfileImage: async (imageFile) => {
    try {
      console.log('Uploading profile image:', imageFile.name, 'size:', imageFile.size, 'type:', imageFile.type);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profileImage', imageFile, imageFile.name);
      
      // Important: Do NOT set Content-Type header manually
      // Let axios set it automatically with the correct boundary
      const config = {
        headers: {
          // No Content-Type header here
        },
        timeout: 30000 // Longer timeout for file uploads
      };
      
      // Make API call to upload the image
      const response = await userServiceClient.post('/user/profile/image', formData, config);
      console.log('Upload response:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
};

export default settingsService;
