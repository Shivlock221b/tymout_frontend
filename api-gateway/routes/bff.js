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
      userInterests,
      deviceType // New parameter for device type
    } = req.query;

    // Get device type from header or query param
    const deviceTypeHeader = req.headers['x-device-type'];
    const isMobile = deviceType === 'mobile' || deviceTypeHeader === 'mobile';
    
    // Log request for debugging
    console.log(`BFF Explore request: ${isMobile ? 'Mobile' : 'Desktop'} device, city: ${city || 'none'}`);

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
      axios.get(`${EVENT_SERVICE_URL}/events/search`, { params: eventParams })
        .catch(err => {
          console.error('Error fetching events:', err.message);
          return { data: [] };
        }),
      
      // Get event categories (could be from a different service or cached)
      axios.get(`${EVENT_SERVICE_URL}/events/categories`)
        .catch(err => {
          console.error('Error fetching categories:', err.message);
          return { data: [] };
        }),
      
      // Get spotlight/featured events
      axios.get(`${EVENT_SERVICE_URL}/events/spotlight`, { 
        params: { city, limit: 5 } 
      }).catch(err => {
        console.error('Error fetching spotlight events:', err.message);
        return { data: [] };
      })
    ]);

    // Ensure we have valid data structures
    const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
    const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
    const spotlight = Array.isArray(spotlightResponse.data) ? spotlightResponse.data : [];
    
    // Log response sizes for debugging
    console.log(`BFF response: ${events.length} events, ${categories.length} categories, ${spotlight.length} spotlight events`);
    
    // Combine all responses into a single object
    res.json({
      events,
      categories,
      spotlight,
      timestamp: Date.now(),
      deviceType: isMobile ? 'mobile' : 'desktop'
    });
  } catch (error) {
    console.error('BFF Explore Error:', error.message);
    
    // Provide fallback data even in error case
    res.status(200).json({ 
      events: [],
      categories: [],
      spotlight: [],
      error: 'Failed to fetch explore data',
      message: error.message,
      timestamp: Date.now(),
      deviceType: isMobile ? 'mobile' : 'desktop'
    });
  }
});

module.exports = router;
