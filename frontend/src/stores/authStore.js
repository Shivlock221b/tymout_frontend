import { create } from 'zustand';
import { createPersistedStore } from './middleware';
import authService from '../services/authService';
import axios from 'axios';

/**
 * Configure axios interceptor to manage auth headers
 * @param {string} token - The authentication token to set in headers
 */
const configureAxiosAuthInterceptor = (token) => {
  // Remove any existing interceptors to prevent duplicates
  // Using ejectRequestInterceptor ensures we don't have memory leaks
  if (window.__authInterceptorId !== undefined) {
    axios.interceptors.request.eject(window.__authInterceptorId);
    window.__authInterceptorId = undefined;
  }
  
  // Add interceptor to include token in all requests
  const interceptorId = axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Store the interceptor ID for future reference
  window.__authInterceptorId = interceptorId;
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
    isAuthenticated: false,
    loading: false,
    error: null,
    
    // Actions
    setUser: (userData, token) => {
      set({ 
        user: userData, 
        token, 
        isAuthenticated: userData !== null && userData !== undefined,
        error: null
      });
      
      // Configure axios headers when token changes
      if (token) {
        configureAxiosAuthInterceptor(token);
      }
    },
    
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const { user, token } = await authService.login(credentials);
        
        // Configure axios headers with new token
        configureAxiosAuthInterceptor(token);
        
        set({ 
          user, 
          token, 
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
          isAuthenticated: false, 
          loading: false,
          error: null
        });
        
        // Remove auth header from axios
        configureAxiosAuthInterceptor(null);
      }
    },
    
    register: async (userData) => {
      set({ loading: true, error: null });
      try {
        const { user, token } = await authService.register(userData);
        
        // Configure axios headers with new token
        configureAxiosAuthInterceptor(token);
        
        set({ 
          user, 
          token, 
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
    
    handleOAuthVerification: async (token) => {
      set({ loading: true, error: null });
      try {
        // Set the token in axios headers for this request only
        const user = await authService.handleOAuthVerification(token);
        
        // If verification successful, configure axios with the token permanently
        configureAxiosAuthInterceptor(token);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          loading: false,
          error: null
        });
        return { success: true };
      } catch (error) {
        set({ 
          loading: false, 
          error: error.message || 'OAuth authentication failed'
        });
        return { success: false, error: get().error };
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
