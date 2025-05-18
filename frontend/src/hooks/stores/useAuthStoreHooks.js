import { useAuthStore } from '../../stores/authStore';
import { useMemo } from 'react';

/**
 * Custom hook for authentication state - isAuthenticated
 * Only selects the isAuthenticated flag and memoizes the result object
 * to prevent unnecessary re-renders
 * 
 * @returns {Object} Authentication state
 */
export const useAuth = () => {
  // Select the isAuthenticated flag directly from store
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // Memoize the resulting object to maintain stable reference
  return useMemo(() => ({ isAuthenticated }), [isAuthenticated]);
};

/**
 * Custom hook for user data
 * @returns {Object} User data
 */
export const useUserData = () => {
  const user = useAuthStore(state => state.user);
  return useMemo(() => ({ user }), [user]);
};

/**
 * Custom hook for auth loading state
 * @returns {Object} Loading state
 */
export const useAuthLoading = () => {
  const loading = useAuthStore(state => state.loading);
  return useMemo(() => ({ loading }), [loading]);
};

/**
 * Custom hook for auth error state
 * @returns {Object} Error state
 */
export const useAuthError = () => {
  const error = useAuthStore(state => state.error);
  return useMemo(() => ({ error }), [error]);
};

/**
 * Custom hook for authentication actions
 * Provides access to auth actions with stable reference using memoization
 * @returns {Object} Authentication actions
 */
export const useAuthActions = () => {
  // Get action functions from the store
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const register = useAuthStore(state => state.register);
  const handleOAuthVerification = useAuthStore(state => state.handleOAuthVerification);
  const clearError = useAuthStore(state => state.clearError);
  
  // Return memoized object to prevent recreation on each render
  return useMemo(() => ({
    login,
    logout,
    register,
    handleOAuthVerification,
    clearError
  }), [login, logout, register, handleOAuthVerification, clearError]);
};
