/**
 * Aggregate categories from events and circles
 */
const aggregateCategories = async (eventCategories, circleCategories) => {
  const categoryMap = new Map();

  // Process event categories
  eventCategories.forEach(category => {
    if (!categoryMap.has(category.name)) {
      categoryMap.set(category.name, {
        name: category.name,
        eventCount: category.count,
        circleCount: 0,
        totalCount: category.count
      });
    }
  });

  // Process circle categories
  circleCategories.forEach(category => {
    if (categoryMap.has(category.name)) {
      const existing = categoryMap.get(category.name);
      existing.circleCount = category.count;
      existing.totalCount += category.count;
    } else {
      categoryMap.set(category.name, {
        name: category.name,
        eventCount: 0,
        circleCount: category.count,
        totalCount: category.count
      });
    }
  });

  // Convert map to array and sort by total count
  return Array.from(categoryMap.values())
    .sort((a, b) => b.totalCount - a.totalCount);
};

/**
 * Add trend scores to results
 */
const addTrendScores = async (results, timeframe) => {
  const now = new Date();
  const timeframeHours = {
    day: 24,
    week: 168,
    month: 720
  }[timeframe];

  // Calculate trend score for events
  results.events = results.events.map(event => {
    const score = calculateTrendScore(event, now, timeframeHours);
    return { ...event, trendScore: score };
  }).sort((a, b) => b.trendScore - a.trendScore);

  // Calculate trend score for circles
  results.circles = results.circles.map(circle => {
    const score = calculateTrendScore(circle, now, timeframeHours);
    return { ...circle, trendScore: score };
  }).sort((a, b) => b.trendScore - a.trendScore);

  return results;
};

/**
 * Calculate trend score based on various factors
 */
const calculateTrendScore = (item, now, timeframeHours) => {
  const hoursSinceCreation = (now - new Date(item.createdAt)) / (1000 * 60 * 60);
  const recency = Math.max(0, 1 - (hoursSinceCreation / timeframeHours));
  
  // Calculate engagement score
  const views = item.stats?.views || 0;
  const likes = item.stats?.likes || 0;
  const comments = item.stats?.comments || 0;
  const shares = item.stats?.shares || 0;
  
  const engagementScore = (
    (views * 1) +
    (likes * 2) +
    (comments * 3) +
    (shares * 4)
  ) / 100; // Normalize score

  // Combine recency and engagement with weights
  return (recency * 0.4) + (engagementScore * 0.6);
};

/**
 * Get content based on user interests
 */
const getContentByInterests = async (interests) => {
  // Convert interests array to weighted interests map
  const weightedInterests = (interests || []).reduce((acc, interest, index) => {
    // Give higher weight to primary interests (earlier in the array)
    acc[interest] = 1 - (index * 0.1);
    return acc;
  }, {});

  // Fetch relevant events and circles
  const { fetchFromService } = require('../utils/serviceUtils');
  
  try {
    // Get events and circles matching the interests
    const interestsParam = interests?.length ? interests.join(',') : '';
    const [events, circles] = await Promise.all([
      fetchFromService('event', '/events/search', {
        params: { interests: interestsParam }
      }),
      fetchFromService('event', '/circles/search', {
        params: { interests: interestsParam }
      })
    ]);

    // Score and sort content based on interest weights
    const scoredEvents = events.data?.map(event => ({
      ...event,
      interestScore: event.interests?.reduce((score, interest) => 
        score + (weightedInterests[interest] || 0), 0) || 0
    })).sort((a, b) => b.interestScore - a.interestScore) || [];

    const scoredCircles = circles.data?.map(circle => ({
      ...circle,
      interestScore: circle.interests?.reduce((score, interest) => 
        score + (weightedInterests[interest] || 0), 0) || 0
    })).sort((a, b) => b.interestScore - a.interestScore) || [];

    return {
      weightedInterests,
      primaryInterests: interests.slice(0, 3),
      secondaryInterests: interests.slice(3),
      recommendations: {
        events: scoredEvents.slice(0, 10),  // Top 10 matching events
        circles: scoredCircles.slice(0, 10)  // Top 10 matching circles
      }
    };
  } catch (error) {
    console.error('[Discovery Service] Error fetching interest-based content:', error);
    throw error;
  }
};

module.exports = {
  aggregateCategories,
  addTrendScores,
  getContentByInterests
};
