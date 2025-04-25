const axios = require('axios');

/**
 * Fetch data from another microservice
 * @param {string} serviceName - Name of the service (e.g., 'user', 'event')
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request body for POST/PUT requests
 * @param {object} headers - Request headers
 * @returns {Promise} - Response from the service
 */
const fetchFromService = async (serviceName, endpoint, options = {}, authToken = null) => {
  const serviceUrls = {
    user: process.env.USER_SERVICE_URL || 'http://localhost:3000/api',
    event: process.env.EVENT_SERVICE_URL || 'http://localhost:3000/api',
    request: process.env.REQUEST_SERVICE_URL || 'http://localhost:3000/api',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000/api'
  };

  const baseURL = serviceUrls[serviceName];
  if (!baseURL) {
    throw new Error(`Invalid service name: ${serviceName}`);
  }

  try {
    const response = await axios({
      method: options.method || 'GET',
      url: `${baseURL}${endpoint}`,
      data: options.data,
      params: options.params,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      },
      timeout: 30000 // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    console.error(`Error calling ${serviceName} service:`, error.message);
    throw error;
  }
};

/**
 * Calculate trend score based on engagement metrics and time
 * @param {object} metrics - Engagement metrics (views, likes, comments, etc.)
 * @param {Date} createdAt - When the item was created
 * @returns {number} - Trend score
 */
const calculateTrendScore = (metrics, createdAt) => {
  const now = new Date();
  const ageInHours = (now - new Date(createdAt)) / (1000 * 60 * 60);
  
  // Decay factor: items lose ~50% of their score every 24 hours
  const decay = Math.pow(0.5, ageInHours / 24);
  
  // Calculate base score from metrics
  const baseScore = (
    (metrics.views || 0) * 1 +
    (metrics.likes || 0) * 2 +
    (metrics.comments || 0) * 3 +
    (metrics.shares || 0) * 4
  );
  
  return baseScore * decay;
};

/**
 * Filter and sort items by city
 * @param {Array} items - Array of events or circles
 * @param {string} city - City to filter by
 * @returns {Array} - Filtered and sorted items
 */
const filterByCity = (items, city) => {
  return items
    .filter(item => item.location?.city?.toLowerCase() === city.toLowerCase())
    .sort((a, b) => calculateTrendScore(b.metrics, b.createdAt) - calculateTrendScore(a.metrics, a.createdAt));
};

module.exports = {
  fetchFromService,
  calculateTrendScore,
  filterByCity
};
