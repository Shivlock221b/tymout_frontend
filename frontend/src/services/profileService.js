import axios from 'axios';

/**
 * Service for managing profile-related API requests
 * Following Single Responsibility Principle - this service only handles profile operations
 */
const profileService = {
  /**
   * Fetch the profile data for the current user
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      // Make an actual API call to get the current user's profile
      const response = await axios.get('/api/users/user/me');
      
      // Check if the request was successful
      if (response.data && response.data.success) {
        console.log('Profile data retrieved:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to fetch profile data');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  /**
   * Get profile data for a specific user by ID
   * @param {string} userId - User ID to fetch profile for
   * @returns {Promise<Object>} User profile data
   */
  getProfileById: async (userId) => {
    try {
      console.log(`Fetching profile for user ID: ${userId}`);
      
      // Use the correct endpoint for the user service
      const response = await axios.get(`/api/users/user/${userId}`);
      
      // Check if the request was successful
      if (response.data && response.data.success) {
        console.log('Profile data retrieved successfully:', response.data.data);
        return response.data.data;
      }
      
      // If we have data but no success flag (different API response format)
      if (response.data && !response.data.success) {
        console.log('Profile data retrieved with alternate format:', response.data);
        return response.data;
      }
      
      throw new Error(`Failed to fetch profile data for user ${userId}`);
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update the current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      // Make an actual API call to update the user's profile
      const response = await axios.put('/api/users/user/profile', profileData);
      
      // Check if the request was successful
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to update profile data');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user preferences
   * @param {Object} preferences - User preferences to update
   * @returns {Promise<Object>} Updated preferences
   */
  updatePreferences: async (preferences) => {
    try {
      // Make an actual API call to update user preferences
      const response = await axios.put('/api/users/user/preferences', preferences);
      
      // Check if the request was successful
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to update preferences');
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
};

export default profileService;
