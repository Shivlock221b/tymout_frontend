import { create } from 'zustand';
import { createPersistedStore } from './middleware';
import authService from '../services/authService';
import axios from 'axios';

/**
 * Configure axios interceptors to manage auth headers and token refresh
 * @param {string} token - The authentication token to set in headers
 */
const configureAxiosAuthInterceptor = (token) => {
  // Remove any existing interceptors to prevent duplicates
  if (window.__authInterceptorId !== undefined) {
    axios.interceptors.request.eject(window.__authInterceptorId);
    window.__authInterceptorId = undefined;
  }
  
  if (window.__authResponseInterceptorId !== undefined) {
    axios.interceptors.response.eject(window.__authResponseInterceptorId);
    window.__authResponseInterceptorId = undefined;
  }
  
  // Add request interceptor to include token in all requests
  const requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      // Always enable credentials for cross-origin requests
      config.withCredentials = true;
      
      if (token) {
        // Set the Authorization header for all requests
        config.headers['Authorization'] = `Bearer ${token}`;
        
        // Ensure token is included in localStorage for persistence
        localStorage.setItem('auth_token', token);
      } else {
        // Try to recover token from localStorage if it exists
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor to handle token expiration
  const responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is 401 (Unauthorized) and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Get the current auth state
          const authStore = useAuthStore.getState();
          const refreshToken = authStore.refreshToken;
          
          if (!refreshToken) {
            // No refresh token available, logout the user
            authStore.logout();
            return Promise.reject(error);
          }
          
          console.log('Token expired, attempting to refresh...');
          
          // Call the refresh token endpoint
          const response = await authService.refreshToken(refreshToken);
          const { user, token: newToken } = response;
          
          // Update the auth store with the new token
          authStore.setUser(user, newToken, refreshToken);
          
          // Update the Authorization header for the original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Retry the original request with the new token
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // If refresh fails, logout the user
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  // Store the interceptor IDs for future reference
  window.__authInterceptorId = requestInterceptorId;
  window.__authResponseInterceptorId = responseInterceptorId;
};

/**
 * Auth store for managing authentication state
 * Following Single Responsibility Principle - this store only manages auth state
 */
export const useAuthStore = create(
  createPersistedStore('auth', (set, get) => ({
    // State
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    
    // Actions
    setUser: (userData, token, refreshToken) => {
      set({ 
        user: userData, 
        token, 
        refreshToken,
        isAuthenticated: userData !== null && userData !== undefined,
        error: null
      });
      
      // Save token directly to localStorage for extra persistence
      if (token) {
        localStorage.setItem('auth_token', token);
        // Configure axios headers when token changes
        configureAxiosAuthInterceptor(token);
      }
    },
    
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const { user, token, refreshToken } = await authService.login(credentials);
        
        // Configure axios headers with new token
        configureAxiosAuthInterceptor(token);
        
        set({ 
          user, 
          token, 
          refreshToken,
          isAuthenticated: true, 
          loading: false,
          error: null
        });
        return { success: true };
      } catch (error) {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Login failed'
        });
        return { success: false, error: get().error };
      }
    },
    
    logout: async () => {
      set({ loading: true });
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Even if the API call fails, clear the local state
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false, 
          loading: false,
          error: null
        });
        
        // Remove token from localStorage
        localStorage.removeItem('auth_token');
        
        // Remove auth header from axios
        configureAxiosAuthInterceptor(null);
      }
    },
    
    register: async (userData) => {
      set({ loading: true, error: null });
      try {
        const { user, token, refreshToken } = await authService.register(userData);
        
        // Configure axios headers with new token
        configureAxiosAuthInterceptor(token);
        
        set({ 
          user, 
          token, 
          refreshToken,
          isAuthenticated: true, 
          loading: false,
          error: null
        });
        return { success: true };
      } catch (error) {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Registration failed'
        });
        return { success: false, error: get().error };
      }
    },
    
    handleOAuthVerification: async (authData) => {
      set({ loading: true, error: null });
      try {
        // Extract token and refreshToken from the authData object
        const { token, refreshToken } = typeof authData === 'string' 
          ? { token: authData, refreshToken: null } // Handle legacy format
          : authData;
        
        if (!token) {
          throw new Error('No token provided');
        }
        
        // Set the token in axios headers for this request only
        const user = await authService.handleOAuthVerification(token);
        
        // If verification successful, configure axios with the token permanently
        configureAxiosAuthInterceptor(token);
        
        set({ 
          user, 
          token, 
          refreshToken, // Store the refresh token from the OAuth callback
          isAuthenticated: true, 
          loading: false,
          error: null
        });
        return { success: true };
      } catch (error) {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'OAuth verification failed'
        });
        return { success: false, error: get().error };
      }
    },
    
    // Refresh the access token using the refresh token
    refreshAccessToken: async () => {
      const { refreshToken } = get();
      if (!refreshToken) {
        console.error('No refresh token available');
        return { success: false, error: 'No refresh token available' };
      }
      
      set({ loading: true, error: null });
      try {
        console.log('Manually refreshing access token...');
        const { user, token } = await authService.refreshToken(refreshToken);
        
        // Update the auth store with the new token but keep the same refresh token
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null
        });
        
        // Configure axios headers with the new token
        configureAxiosAuthInterceptor(token);
        
        return { success: true };
      } catch (error) {
        console.error('Manual token refresh failed:', error);
        
        // If refresh fails, logout the user
        get().logout();
        
        return { success: false, error: 'Failed to refresh token' };
      }
    },
    
    clearError: () => set({ error: null })
  }))
);

// Initialize auth when store is imported
export const initializeAuth = () => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      
      if (state?.token) {
        configureAxiosAuthInterceptor(state.token);
      }
    } catch (error) {
      console.error('Error initializing auth headers:', error);
    }
  }
};

// DISABLED: Automatic initialization (to prevent infinite loop)
// Call initializeAuth() manually in index.js or App.js instead
// initializeAuth();
