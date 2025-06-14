import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * BFF (Backend For Frontend) Service
 * 
 * This service interacts with optimized BFF endpoints that aggregate data
 * from multiple microservices to reduce frontend API calls and improve performance.
 */
const bffService = {
  /**
   * Get explore page data from BFF endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - BFF response with events, categories, and spotlight
   */
  getExplorePageData: async (params = {}) => {
    try {
      // Detect if we're on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      console.log('BFF Service: Fetching data for', isMobile ? 'mobile' : 'desktop', 'device');
      console.log('BFF Service: Params:', params);
      
      // Add device type to params and headers
      const deviceType = isMobile ? 'mobile' : 'desktop';
      params.deviceType = deviceType;
      
      const headers = {
        'x-device-type': deviceType,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      // Increase timeout for mobile devices
      const timeout = isMobile ? 15000 : 5000; // 15 seconds for mobile, 5 for desktop
      
      // For mobile, try direct API call first if BFF is failing
      if (isMobile && params.bypassBff) {
        console.log('BFF Service: Bypassing BFF for mobile, using direct API');
        // This will be handled by the fallback in ExplorePage
        throw new Error('Bypassing BFF for mobile device');
      }
      
      const response = await axios.get(`${API_URL}/bff/explore`, {
        params,
        headers,
        timeout
      });
      
      // Validate response structure
      if (!response.data) {
        console.error('Invalid BFF response: empty data');
        return { events: [], categories: [], spotlight: [] };
      }
      
      // Ensure events is always an array
      const events = Array.isArray(response.data.events) ? response.data.events : [];
      const categories = Array.isArray(response.data.categories) ? response.data.categories : [];
      const spotlight = Array.isArray(response.data.spotlight) ? response.data.spotlight : [];
      
      console.log(`BFF Service: Received ${events.length} events, ${categories.length} categories, ${spotlight.length} spotlight events`);
      
      // If on mobile and no events, throw error to trigger fallback
      if (isMobile && events.length === 0) {
        console.log('BFF Service: No events for mobile, triggering fallback');
        throw new Error('No events from BFF for mobile device');
      }
      
      return {
        events,
        categories,
        spotlight,
        timestamp: response.data.timestamp || Date.now()
      };
    } catch (error) {
      console.error('Error fetching BFF data:', error.message);
      // Instead of returning empty arrays, throw the error to trigger a retry
      // This will allow the query to retry and potentially succeed on subsequent attempts
      throw error;
    }
  }
};

export default bffService;
