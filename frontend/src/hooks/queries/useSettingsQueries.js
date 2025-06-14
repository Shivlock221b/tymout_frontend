import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import settingsService from '../../services/settingsService';

/**
 * Custom hook for updating profile settings
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @returns {Object} - React Query mutation object for profile settings
 */
export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);
  const token = useAuthStore(state => state.token);
  const refreshToken = useAuthStore(state => state.refreshToken);
  
  return useMutation({
    mutationFn: (profileData) => settingsService.updateProfileSettings(profileData),
    
    onSuccess: (data) => {
      // Update the profile data in the cache
      queryClient.setQueryData(['profile'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
      
      // Update the user data in the auth store
      queryClient.setQueryData(['user'], oldData => {
        if (!oldData) return oldData;
        const updatedUser = { ...oldData, ...data };
        // Update the auth store with the updated user data
        setUser(updatedUser, token, refreshToken);
        return updatedUser;
      });
      
      // Invalidate the profile query to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
  const setUser = useAuthStore(state => state.setUser);
  const token = useAuthStore(state => state.token);
  const refreshToken = useAuthStore(state => state.refreshToken);
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: (imageFile) => settingsService.uploadProfileImage(imageFile),
    
    onSuccess: (data) => {
      console.log('Profile image upload successful:', data);
      
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
      
      // Update the auth store with the new profile image
      if (user) {
        const updatedUser = { ...user, profileImage: data.profileImage };
        setUser(updatedUser, token, refreshToken);
        console.log('Updated user in auth store with new profile image:', updatedUser);
        
        // Also update localStorage directly to ensure persistence
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed.state && parsed.state.user) {
              parsed.state.user.profileImage = data.profileImage;
              localStorage.setItem('auth-storage', JSON.stringify(parsed));
              console.log('Updated profile image in localStorage auth-storage');
            }
          }
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};

/**
 * Custom hook for removing profile image
 * 
 * @returns {Object} - React Query mutation object for removing profile image
 */
export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);
  const token = useAuthStore(state => state.token);
  const refreshToken = useAuthStore(state => state.refreshToken);
  const user = useAuthStore(state => state.user);
  
  return useMutation({
    mutationFn: () => settingsService.removeProfileImage(),
    
    onSuccess: (data) => {
      console.log('Profile image removal successful:', data);
      
      // Update the profile data in the cache
      queryClient.setQueryData(['profile'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, profileImage: null };
      });
      
      // Update the user data in the cache
      queryClient.setQueryData(['user'], oldData => {
        if (!oldData) return oldData;
        return { ...oldData, profileImage: null };
      });
      
      // Update the auth store with the removed profile image
      if (user) {
        const updatedUser = { ...user, profileImage: null };
        setUser(updatedUser, token, refreshToken);
        console.log('Updated user in auth store after removing profile image:', updatedUser);
        
        // Also update localStorage directly to ensure persistence
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed.state && parsed.state.user) {
              parsed.state.user.profileImage = null;
              localStorage.setItem('auth-storage', JSON.stringify(parsed));
              console.log('Removed profile image in localStorage auth-storage');
            }
          }
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
};
