import axios from 'axios';

/**
 * BFF (Backend For Frontend) Service
 * 
 * This service interacts with optimized BFF endpoints that aggregate data
 * from multiple microservices to reduce frontend API calls and improve performance.
 */
const bffService = {
  /**
   * Get all data needed for the explore page in a single request
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} - Object containing events, categories, and spotlight data
   */
  getExplorePageData: async (params = {}) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/bff/explore`, { 
        params,
        // Use a longer timeout for this comprehensive request
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching explore page data:', error);
      // If BFF endpoint fails, return empty data structure
      return {
        events: [],
        categories: [],
        spotlight: [],
        error: error.message
      };
    }
  }
};

export default bffService;
