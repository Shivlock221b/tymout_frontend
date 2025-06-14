import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Configure axios client for user service - same as in settingsService
const userServiceClient = axios.create({
  baseURL: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001', // User service runs on port 3001
  timeout: 10000
  // Don't set default Content-Type here as it will be overridden for FormData
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

/**
 * Upload profile image during onboarding
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Updated user data with profile image URL
 */
const uploadOnboardingProfileImage = async (imageFile) => {
  try {
    console.log('Uploading onboarding profile image:', imageFile.name, 'size:', imageFile.size, 'type:', imageFile.type);
    
    // Create a new instance of FormData
    const formData = new FormData();
    
    // Explicitly append the file with the correct field name
    formData.append('profileImage', imageFile, imageFile.name);
    
    // Log the FormData contents for debugging
    console.log('FormData created with file:', imageFile.name);
    
    // Create a custom instance for this specific request
    const instance = axios.create({
      baseURL: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001',
      timeout: 30000 // Longer timeout for file uploads
    });
    
    // Add auth token to this specific request
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
        if (token) {
          console.log('Auth token found and will be used for upload');
        }
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    }
    
    // Make direct API call to the user service
    // Important: Do NOT set Content-Type header manually for FormData
    const response = await instance.post('/user/profile/image', formData, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        // Let axios set the Content-Type with boundary automatically
      }
    });
    
    console.log('Upload response:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Custom hook for uploading profile image during onboarding
 * @returns {Object} - React Query mutation object for profile image upload
 */
export const useUploadOnboardingProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: uploadOnboardingProfileImage,
    
    onSuccess: (data) => {
      // Update the user data in the cache
      queryClient.setQueryData(['user'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, profileImage: data.profileImage };
      });
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};
