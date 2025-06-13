const express = require('express');
const axios = require('axios');
const router = express.Router();

// Environment variables with fallbacks
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
const DISCOVERY_SERVICE_URL = process.env.DISCOVERY_SERVICE_URL || 'http://localhost:3003';

/**
 * BFF (Backend For Frontend) endpoint for the Explore page
 * Aggregates data from multiple services into a single response
 */
router.get('/explore', async (req, res) => {
  try {
    // Extract query parameters
    const { 
      q: query, 
      tag: tags, 
      view, 
      timeFilter, 
      distance, 
      sort: sortBy,
      city,
      userInterests
    } = req.query;

    // Prepare parameters for event service
    const eventParams = {
      query,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      view,
      timeFilter,
      distance,
      sortBy,
      city
    };

    // If "Only For You" view is selected, include user interests
    if (view === 'Only For You' && userInterests) {
      eventParams.userInterests = Array.isArray(userInterests) 
        ? userInterests 
        : userInterests.split(',');
    }

    // Make parallel requests to different services
    const [eventsResponse, categoriesResponse, spotlightResponse] = await Promise.all([
      // Get events matching the filters
      axios.get(`${EVENT_SERVICE_URL}/events/search`, { params: eventParams }),
      
      // Get event categories (could be from a different service or cached)
      axios.get(`${EVENT_SERVICE_URL}/events/categories`).catch(() => ({ data: [] })),
      
      // Get spotlight/featured events
      axios.get(`${EVENT_SERVICE_URL}/events/spotlight`, { 
        params: { city, limit: 5 } 
      }).catch(() => ({ data: [] }))
    ]);

    // Combine all responses into a single object
    res.json({
      events: eventsResponse.data,
      categories: categoriesResponse.data,
      spotlight: spotlightResponse.data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('BFF Explore Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch explore data',
      message: error.message
    });
  }
});

module.exports = router;
