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
  baseURL: process.env.USER_SERVICE_URL || 'http://localhost:3001', // User service runs on port 3001
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add auth token
userServiceClient.interceptors.request.use(
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

const settingsService = {
  /**
   * Update profile settings
   * @param {Object} profileData - Profile settings data
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfileSettings: async (profileData) => {
    try {
      // In a production environment, this would be an API call
      // const response = await axios.put('/api/settings/profile', profileData);
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...profileData,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating profile settings:', error);
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
      // In a production environment, this would be an API call
      // const response = await axios.put('/api/settings/account', accountData);
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...accountData,
        updatedAt: new Date().toISOString()
      };
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
      // In a production environment, this would be an API call
      // const response = await axios.put('/api/settings/privacy', privacyData);
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...privacyData,
        updatedAt: new Date().toISOString()
      };
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
      // In a production environment, this would be an API call
      // const response = await axios.put('/api/settings/notifications', notificationData);
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...notificationData,
        updatedAt: new Date().toISOString()
      };
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
