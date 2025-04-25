const recommendationService = require('../services/recommendationService');
const { fetchFromService } = require('../utils/serviceUtils');

/**
 * Get personalized recommendations based on user preferences and history
 */
const getPersonalizedRecommendations = async (userId, type, limit) => {
  // Get user profile including current city
  const userProfile = await fetchFromService('user', `/users/${userId}`);
  const userCity = userProfile.data?.currentCity;
  
  if (!userCity) {
    throw new Error('Please set your current city to get personalized recommendations.');
  }
  try {
    // Get user data and history
    const [userProfile, userHistory] = await Promise.all([
      fetchFromService('user', `/users/${userId}/preferences`),
      fetchFromService('user', `/users/${userId}/history`)
    ]);

    const userInterests = userProfile.data?.interests || [];
    const userLocation = userProfile.data?.location;
    const history = userHistory.data || [];

    // Get recommendations based on user data
    const recommendations = await recommendationService.getPersonalizedContent(
      userId,
      userInterests,
      userLocation,
      history,
      type,
      limit
    );

    return recommendations;
  } catch (error) {
    console.error('[Recommendation Controller] Error getting personalized recommendations:', error);
    throw error;
  }
};

/**
 * Get similar items to a given event or circle
 */
const getSimilarItems = async (type, id, limit) => {
  try {
    // Get item details
    const itemDetails = await fetchFromService(
      type === 'events' ? 'event' : 'circle',
      `/${type}/${id}`
    );

    // Get similar items based on content
    const similar = await recommendationService.getSimilarContent(
      type,
      itemDetails.data,
      limit
    );

    return similar;
  } catch (error) {
    console.error('[Recommendation Controller] Error getting similar items:', error);
    throw error;
  }
};

/**
 * Get featured events and circles
 */
const getFeaturedItems = async (type, limit) => {
  try {
    let results = { events: [], circles: [] };

    if (type === 'all' || type === 'events') {
      // Get featured events
      const events = await fetchFromService('event', '/events/featured', {
        params: { limit }
      });
      results.events = events.data || [];
    }

    if (type === 'all' || type === 'circles') {
      // Get featured circles
      const circles = await fetchFromService('event', '/circles/featured', {
        params: { limit }
      });
      results.circles = circles.data || [];
    }

    // Add feature scores and sort
    results = await recommendationService.rankFeaturedContent(results);

    return results;
  } catch (error) {
    console.error('[Recommendation Controller] Error getting featured items:', error);
    throw error;
  }
};

/**
 * Get popular events and circles
 */
const getPopularItems = async (type, timeframe, limit) => {
  try {
    let results = { events: [], circles: [] };

    if (type === 'all' || type === 'events') {
      // Get popular events
      const events = await fetchFromService('event', '/events/popular', {
        params: { timeframe, limit }
      });
      results.events = events.data || [];
    }

    if (type === 'all' || type === 'circles') {
      // Get popular circles
      const circles = await fetchFromService('event', '/circles/popular', {
        params: { timeframe, limit }
      });
      results.circles = circles.data || [];
    }

    // Add popularity scores and sort
    results = await recommendationService.rankPopularContent(results, timeframe);

    return results;
  } catch (error) {
    console.error('[Recommendation Controller] Error getting popular items:', error);
    throw error;
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getSimilarItems,
  getFeaturedItems,
  getPopularItems
};
