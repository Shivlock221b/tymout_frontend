import axios from 'axios';

// Configure axios defaults for cross-origin requests
axios.defaults.withCredentials = true;

/**
 * Service for managing authentication-related API requests
 * Following Single Responsibility Principle - this service only handles auth operations
 */
const authService = {
  /**
   * Get the current authenticated user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    try {
      // This endpoint should be available at /auth/current through the API gateway
      const response = await axios.get('/api/users/auth/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  /**
   * Login with email and password
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise<Object>} Authentication result with user and token
   */
  login: async (credentials) => {
    try {
      const response = await axios.post('/api/users/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result with user and token
   */
  register: async (userData) => {
    try {
      const response = await axios.post('/api/users/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Logout the current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await axios.post('/api/users/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Handle OAuth authentication verification
   * @param {string} token - Authentication token to verify
   * @returns {Promise<Object>} User data
   */
  handleOAuthVerification: async (token) => {
    if (!token) {
      throw new Error('No token received');
    }
    
    try {
      // Fetch user data using the provided token
      const response = await axios.get('/api/users/auth/oauth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('OAuth verification error:', error);
      throw error;
    }
  },
  
  /**
   * Refresh the access token using a refresh token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<Object>} New authentication data with user and token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post('/api/users/auth/refresh-token', { refreshToken });
      return response.data.data; // Extract the data from the response
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }
};

export default authService;
