import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import profileService from '../../services/profileService';
import { useAuthStore } from '../../stores/authStore';

/**
 * Hook to fetch the current user
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result containing current user data, loading and error states
 */
export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    staleTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 unauthorized errors
      if (error?.response?.status === 401) return false;
      return failureCount < 2; // Otherwise retry twice
    },
    ...options
  });
};

/**
 * Hook for login handler
 * @returns {Object} Mutation object with login function and state
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const login = useAuthStore(state => state.login);
  
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      // After successful login, invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Prefetch profile data
      queryClient.prefetchQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getProfile()
      });
    },
    onError: (error) => {
      console.error('Login error in React Query:', error);
      // The actual error handling is done in the authStore
    }
  });
};

/**
 * Hook for registration handler
 * @returns {Object} Mutation object with register function and state
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  const register = useAuthStore(state => state.register);
  
  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      // After successful registration, invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Prefetch profile data
      queryClient.prefetchQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getProfile()
      });
    },
    onError: (error) => {
      console.error('Registration error in React Query:', error);
      // The actual error handling is done in the authStore
    }
  });
};

/**
 * Hook for logout handler
 * @returns {Object} Mutation object with logout function and state
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all authentication-related queries from cache
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.setQueryData(['currentUser'], null);
      
      // Remove profile and other user-specific data from cache
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });

      // Redirect to home page after logout
      navigate('/');
    },
    onError: (error) => {
      console.error('Logout error in React Query:', error);
      // The actual error handling is done in the authStore
      // Even on error, we should clear local queries
      queryClient.setQueryData(['currentUser'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
    }
  });
};

/**
 * Hook for OAuth verification handler
 * @returns {Object} Mutation object with handleOAuthVerification function and state
 */
export const useOAuthVerification = () => {
  const queryClient = useQueryClient();
  const handleOAuthVerification = useAuthStore(state => state.handleOAuthVerification);
  
  return useMutation({
    mutationFn: handleOAuthVerification,
    onSuccess: () => {
      // After successful OAuth login, invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Prefetch profile data
      queryClient.prefetchQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getProfile()
      });
    },
    onError: (error) => {
      console.error('OAuth verification error in React Query:', error);
      // The actual error handling is done in the authStore and UI components
    }
  });
};

// Export the original hook name for backward compatibility during migration
export const useOAuthSuccess = useOAuthVerification;
