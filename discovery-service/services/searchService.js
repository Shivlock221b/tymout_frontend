/**
 * Build search query based on filters
 */
const buildSearchQuery = async (filters) => {
  const query = {
    city: filters.city // Always include city filter
  };

  // Add text search if query provided
  if (filters.query) {
    query.$text = { $search: filters.query };
  }

  // Add category filter
  if (filters.category) {
    query.category = filters.category;
  }

  // Add date range filters
  if (filters.dateRange?.start || filters.dateRange?.end) {
    query.date = {};
    if (filters.dateRange.start) {
      query.date.$gte = new Date(filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      query.date.$lte = new Date(filters.dateRange.end);
    }
  }

  // Add price range filter
  if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) {
    query.price = {};
    if (filters.priceRange.min !== undefined) {
      query.price.$gte = filters.priceRange.min;
    }
    if (filters.priceRange.max !== undefined) {
      query.price.$lte = filters.priceRange.max;
    }
  }

  // Add tags filter
  if (filters.tags?.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Add capacity filter
  if (filters.capacity) {
    query.capacity = { $gte: filters.capacity };
  }

  // Add status filter
  if (filters.status) {
    query.status = filters.status;
  }

  return query;
};

/**
 * Get event suggestions for autocomplete
 */
const getEventSuggestions = async (query) => {
  // Return event titles that match the query
  return [
    { type: 'event', text: query + ' events' },
    { type: 'event', text: 'Events with ' + query }
  ];
};

/**
 * Get circle suggestions for autocomplete
 */
const getCircleSuggestions = async (query) => {
  // Return circle names that match the query
  return [
    { type: 'circle', text: query + ' circles' },
    { type: 'circle', text: 'Circles about ' + query }
  ];
};

/**
 * Get tag suggestions for autocomplete
 */
const getTagSuggestions = async (query) => {
  // Return tags that match the query
  return [
    { type: 'tag', text: '#' + query },
    { type: 'tag', text: '#trending' + query }
  ];
};

/**
 * Rank and deduplicate suggestions
 */
const rankSuggestions = async (suggestions, query) => {
  const allSuggestions = [
    ...suggestions.events,
    ...suggestions.circles,
    ...suggestions.tags
  ];

  // Remove duplicates
  const uniqueSuggestions = Array.from(new Set(allSuggestions.map(s => s.text)))
    .map(text => allSuggestions.find(s => s.text === text));

  // Sort by relevance (exact match first, then starts with, then contains)
  return uniqueSuggestions.sort((a, b) => {
    const aText = a.text.toLowerCase();
    const bText = b.text.toLowerCase();
    const queryLower = query.toLowerCase();

    if (aText === queryLower && bText !== queryLower) return -1;
    if (bText === queryLower && aText !== queryLower) return 1;
    if (aText.startsWith(queryLower) && !bText.startsWith(queryLower)) return -1;
    if (bText.startsWith(queryLower) && !aText.startsWith(queryLower)) return 1;
    return 0;
  });
};

/**
 * Apply search ranking to results
 */
const applySearchRanking = async (results, filters) => {
  const sortFn = getSortFunction(filters.sort);

  if (filters.type === 'all' || filters.type === 'events') {
    results.events.sort(sortFn);
  }

  if (filters.type === 'all' || filters.type === 'circles') {
    results.circles.sort(sortFn);
  }

  return results;
};

/**
 * Get sort function based on sort type
 */
const getSortFunction = (sortType) => {
  switch (sortType) {
    case 'date':
      return (a, b) => new Date(b.date?.start || b.createdAt) - new Date(a.date?.start || a.createdAt);
    case 'price':
      return (a, b) => (a.price || 0) - (b.price || 0);
    case 'relevance':
    default:
      return (a, b) => (b.score || 0) - (a.score || 0);
  }
};

module.exports = {
  buildSearchQuery,
  getEventSuggestions,
  getCircleSuggestions,
  getTagSuggestions,
  rankSuggestions,
  applySearchRanking
};
