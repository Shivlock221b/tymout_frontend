import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const SHOP_SERVICE_URL = `${API_URL}/shop-service`;

/**
 * Shop Service
 * Handles all API calls to the shop-service backend
 */
const shopService = {
  /**
   * Fetch a shop by user ID
   * @param {string} userId - The user ID to fetch the shop for
   * @returns {Promise<Object>} - The shop data
   */
  fetchShopByUserId: async (userId) => {
    try {
      const response = await axios.get(`${SHOP_SERVICE_URL}/shops/user/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Shop not found for this user is a valid case
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new shop
   * @param {Object} shopData - The shop data to create
   * @returns {Promise<Object>} - The created shop data
   */
  createShop: async (shopData) => {
    const response = await axios.post(`${SHOP_SERVICE_URL}/shops`, shopData);
    return response.data;
  },

  /**
   * Update an existing shop
   * @param {Object} shopData - The shop data to update
   * @returns {Promise<Object>} - The updated shop data
   */
  updateShop: async (shopData) => {
    const response = await axios.put(`${SHOP_SERVICE_URL}/shops/${shopData.id}`, shopData);
    return response.data;
  },

  /**
   * Fetch a shop by shop ID
   * @param {string} shopId - The shop ID to fetch
   * @returns {Promise<Object>} - The shop data
   */
  fetchShopById: async (shopId) => {
    const response = await axios.get(`${SHOP_SERVICE_URL}/shops/${shopId}`);
    return response.data;
  },

  /**
   * Fetch all shops with optional filters
   * @param {Object} filters - Optional filters for the shops
   * @returns {Promise<Array>} - Array of shop data
   */
  fetchShops: async (filters = {}) => {
    const response = await axios.get(`${SHOP_SERVICE_URL}/shops`, { params: filters });
    return response.data;
  }
};

export default shopService;
