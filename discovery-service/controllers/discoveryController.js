const discoveryService = require('../services/discoveryService');
const { fetchFromService } = require('../utils/serviceUtils');

/**
 * Get events and circles in a specific city
 */
const getItemsByCity = async (city, type) => {
  try {
    // Get events and/or circles based on type
    let results = { events: [], circles: [] };

    if (type === 'all' || type === 'events') {
      // Fetch events in the city from event service
      const events = await fetchFromService('event', '/events/city', {
        params: { city }
      });
      results.events = events.data || [];
    }

    if (type === 'all' || type === 'circles') {
      // Fetch circles in the city from event service
      const circles = await fetchFromService('event', '/circles/city', {
        params: { city }
      });
      results.circles = circles.data || [];
    }

    return results;
  } catch (error) {
    console.error('[Discovery Controller] Error getting nearby items:', error);
    throw error;
  }
};

/**
 * Get all available categories with their counts
 */
const getCategories = async () => {
  try {
    // Fetch categories from both events and circles
    const [eventCategories, circleCategories] = await Promise.all([
      fetchFromService('event', '/events/categories'),
      fetchFromService('event', '/circles/categories')
    ]);

    // Combine and aggregate categories
    const categories = await discoveryService.aggregateCategories(
      eventCategories.data || [],
      circleCategories.data || []
    );

    return categories;
  } catch (error) {
    console.error('[Discovery Controller] Error getting categories:', error);
    throw error;
  }
};

/**
 * Get trending events and circles
 */
const getTrendingItems = async (type, timeframe) => {
  try {
    let results = { events: [], circles: [] };

    if (type === 'all' || type === 'events') {
      // Fetch trending events
      const events = await fetchFromService('event', '/events/trending', {
        params: { timeframe }
      });
      results.events = events.data || [];
    }

    if (type === 'all' || type === 'circles') {
      // Fetch trending circles
      const circles = await fetchFromService('event', '/circles/trending', {
        params: { timeframe }
      });
      results.circles = circles.data || [];
    }

    // Add engagement metrics and sort by trend score
    results = await discoveryService.addTrendScores(results, timeframe);

    return results;
  } catch (error) {
    console.error('[Discovery Controller] Error getting trending items:', error);
    throw error;
  }
};

/**
 * Get content based on user interests
 */
const getInterestBasedContent = async (userId, authToken) => {
  try {
    console.log('[Discovery Controller] Getting interest-based content for user:', userId);
    console.log('[Discovery Controller] Using auth token:', authToken);
    // Get user interests from user service
    console.log('[Discovery Controller] Fetching user preferences from user service');
    const userProfile = await fetchFromService('user', `/users/user/preferences`, {}, authToken);
    console.log('[Discovery Controller] User preferences response:', userProfile.data);
    const interests = userProfile.data?.interests || [];

    // Get recommendations based on interests
    console.log('[Discovery Controller] Found interests:', interests);
    console.log('[Discovery Controller] Getting recommendations based on interests');
    const recommendations = await discoveryService.getContentByInterests(interests);
    console.log('[Discovery Controller] Got recommendations:', recommendations);

    return recommendations;
  } catch (error) {
    console.error('[Discovery Controller] Error getting interest-based content:', error);
    throw error;
  }
};

module.exports = {
  getItemsByCity,
  getCategories,
  getTrendingItems,
  getInterestBasedContent
};
