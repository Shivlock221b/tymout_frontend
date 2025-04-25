import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import profileService from '../../services/profileService';

/**
 * Hook to fetch the current user's profile
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result containing profile data, loading and error states
 */
export const useProfile = (options = {}) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    ...options
  });
};

/**
 * Hook to fetch a user profile by ID
 * @param {string} userId - User ID to fetch profile for
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result containing profile data, loading and error states
 */
export const useProfileById = (userId, options = {}) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getProfileById(userId),
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    enabled: !!userId, // Only run query if userId is provided
    ...options
  });
};

/**
 * Hook to update the current user's profile
 * @returns {Object} Mutation object with mutate function and state
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileService.updateProfile,
    // When mutation is successful, invalidate the profile cache
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    }
  });
};

/**
 * Hook to update user preferences
 * @returns {Object} Mutation object with mutate function and state
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileService.updatePreferences,
    // When mutation is successful, invalidate the profile cache
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};
