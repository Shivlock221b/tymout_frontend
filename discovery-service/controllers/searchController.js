const searchService = require('../services/searchService');
const { fetchFromService } = require('../utils/serviceUtils');

/**
 * Search across events and circles with advanced filtering
 */
const search = async (filters, userId) => {
  // Get user's current city if not explicitly provided in filters
  if (!filters.city) {
    const userProfile = await fetchFromService('user', `/users/${userId}`);
    filters.city = userProfile.data?.currentCity;
    
    if (!filters.city) {
      throw new Error('City is required for search. Please set your current city.');
    }
  }
  try {
    let results = { events: [], circles: [], total: 0 };

    // Build search query for both events and circles
    const searchQuery = await searchService.buildSearchQuery(filters);

    if (filters.type === 'all' || filters.type === 'events') {
      // Search events
      const events = await fetchFromService('event', '/events/search', {
        params: {
          ...searchQuery,
          page: filters.pagination.page,
          limit: filters.pagination.limit
        }
      });
      results.events = events.data?.items || [];
      results.total += events.data?.total || 0;
    }

    if (filters.type === 'all' || filters.type === 'circles') {
      // Search circles
      const circles = await fetchFromService('event', '/circles/search', {
        params: {
          ...searchQuery,
          page: filters.pagination.page,
          limit: filters.pagination.limit
        }
      });
      results.circles = circles.data?.items || [];
      results.total += circles.data?.total || 0;
    }

    // Apply sorting and relevance scoring
    results = await searchService.applySearchRanking(results, filters);

    // Add pagination metadata
    results.pagination = {
      page: filters.pagination.page,
      limit: filters.pagination.limit,
      total: results.total,
      pages: Math.ceil(results.total / filters.pagination.limit)
    };

    return results;
  } catch (error) {
    console.error('[Search Controller] Error performing search:', error);
    throw error;
  }
};

/**
 * Get autocomplete suggestions for search
 */
const getAutocompleteSuggestions = async (query, type) => {
  try {
    let suggestions = { events: [], circles: [], tags: [] };

    // Get suggestions based on type
    if (type === 'all' || type === 'events') {
      const eventSuggestions = await searchService.getEventSuggestions(query);
      suggestions.events = eventSuggestions;
    }

    if (type === 'all' || type === 'circles') {
      const circleSuggestions = await searchService.getCircleSuggestions(query);
      suggestions.circles = circleSuggestions;
    }

    // Get tag suggestions regardless of type
    suggestions.tags = await searchService.getTagSuggestions(query);

    // Deduplicate and rank suggestions
    suggestions = await searchService.rankSuggestions(suggestions, query);

    return suggestions;
  } catch (error) {
    console.error('[Search Controller] Error getting autocomplete suggestions:', error);
    throw error;
  }
};

module.exports = {
  search,
  getAutocompleteSuggestions
};
