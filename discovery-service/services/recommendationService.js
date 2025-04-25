/**
 * Get personalized content based on user data
 */
const getPersonalizedContent = async (userId, interests, userCity, history, type, limit) => {
  let recommendations = { events: [], circles: [] };

  // Get items based on user's interests in their city
  if (type === 'all' || type === 'events') {
    recommendations.events = await getRecommendedEvents(
      interests,
      userCity,
      history,
      limit
    );
  }

  if (type === 'all' || type === 'circles') {
    recommendations.circles = await getRecommendedCircles(
      interests,
      userCity,
      history,
      limit
    );
  }

  return recommendations;
};

/**
 * Get recommended events based on interests
 */
const getRecommendedEvents = async (interests, city, history, limit) => {
  // Filter parameters for events
  const params = {
    city,
    interests,
    excludeIds: history.map(h => h.eventId).filter(Boolean),
    limit
  };

  // Get events that match user's interests
  const events = await fetchFromService('event', '/events/recommended', {
    params
  });

  return events.data || [];
};

/**
 * Get recommended circles based on interests
 */
const getRecommendedCircles = async (interests, city, history, limit) => {
  // Filter parameters for circles
  const params = {
    city,
    interests,
    excludeIds: history.map(h => h.circleId).filter(Boolean),
    limit
  };

  // Get circles that match user's interests
  const circles = await fetchFromService('event', '/circles/recommended', {
    params
  });

  return circles.data || [];
};

/**
 * Get similar content based on item
 */
const getSimilarContent = async (type, item, limit) => {
  // Extract relevant features for similarity matching
  const features = {
    category: item.category,
    tags: item.tags,
    city: item.city || item.location?.city
  };

  // Get similar items
  const similar = await fetchFromService('event', `/${type}/similar`, {
    params: {
      ...features,
      excludeId: item._id,
      limit
    }
  });

  return similar.data || [];
};

/**
 * Rank featured content
 */
const rankFeaturedContent = async (results) => {
  // Add feature score based on various factors
  results.events = results.events.map(event => ({
    ...event,
    featureScore: calculateFeatureScore(event)
  })).sort((a, b) => b.featureScore - a.featureScore);

  results.circles = results.circles.map(circle => ({
    ...circle,
    featureScore: calculateFeatureScore(circle)
  })).sort((a, b) => b.featureScore - a.featureScore);

  return results;
};

/**
 * Calculate feature score for ranking
 */
const calculateFeatureScore = (item) => {
  const baseScore = item.featured ? 100 : 0;
  
  // Add points for engagement
  const views = item.stats?.views || 0;
  const likes = item.stats?.likes || 0;
  const members = item.stats?.memberCount || 0;
  
  return baseScore + 
    (views * 0.1) + 
    (likes * 0.5) + 
    (members * 1);
};

/**
 * Rank popular content
 */
const rankPopularContent = async (results, timeframe) => {
  const timeframeMultiplier = {
    day: 24,
    week: 3,
    month: 1
  }[timeframe];

  // Add popularity score based on engagement and timeframe
  results.events = results.events.map(event => ({
    ...event,
    popularityScore: calculatePopularityScore(event, timeframeMultiplier)
  })).sort((a, b) => b.popularityScore - a.popularityScore);

  results.circles = results.circles.map(circle => ({
    ...circle,
    popularityScore: calculatePopularityScore(circle, timeframeMultiplier)
  })).sort((a, b) => b.popularityScore - a.popularityScore);

  return results;
};

/**
 * Calculate popularity score
 */
const calculatePopularityScore = (item, timeframeMultiplier) => {
  const views = item.stats?.views || 0;
  const likes = item.stats?.likes || 0;
  const comments = item.stats?.comments || 0;
  const shares = item.stats?.shares || 0;
  const members = item.stats?.memberCount || 0;

  return ((views * 1) + 
          (likes * 2) + 
          (comments * 3) + 
          (shares * 4) + 
          (members * 5)) * timeframeMultiplier;
};

module.exports = {
  getPersonalizedContent,
  getSimilarContent,
  rankFeaturedContent,
  rankPopularContent
};
