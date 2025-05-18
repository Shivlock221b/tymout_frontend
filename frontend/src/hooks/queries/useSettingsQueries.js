import { useMutation, useQueryClient } from '@tanstack/react-query';
import settingsService from '../../services/settingsService';

/**
 * Custom hook for updating profile settings
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @returns {Object} - React Query mutation object for profile settings
 */
export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData) => settingsService.updateProfileSettings(profileData),
    
    onSuccess: (data) => {
      // Update the profile data in the cache
      queryClient.setQueryData(['profile'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
      
      // Invalidate the profile query to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

/**
 * Custom hook for updating account settings
 * 
 * @returns {Object} - React Query mutation object for account settings
 */
export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (accountData) => settingsService.updateAccountSettings(accountData),
    
    onSuccess: (data) => {
      // Update any potentially related data in cache
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};

/**
 * Custom hook for updating privacy settings
 * 
 * @returns {Object} - React Query mutation object for privacy settings
 */
export const useUpdatePrivacySettings = () => {
  return useMutation({
    mutationFn: (privacyData) => settingsService.updatePrivacySettings(privacyData)
  });
};

/**
 * Custom hook for updating notification settings
 * 
 * @returns {Object} - React Query mutation object for notification settings
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationData) => 
      settingsService.updateNotificationSettings(notificationData),
    
    onSuccess: () => {
      // Invalidate notifications queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

/**
 * Custom hook for uploading profile image
 * 
 * @returns {Object} - React Query mutation object for profile image upload
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageFile) => settingsService.uploadProfileImage(imageFile),
    
    onSuccess: (data) => {
      // Update the profile data in the cache
      queryClient.setQueryData(['profile'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, profileImage: data.profileImage };
      });
      
      // Update the user data in the cache
      queryClient.setQueryData(['user'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, profileImage: data.profileImage };
      });
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};
