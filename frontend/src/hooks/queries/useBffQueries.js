import { useQuery, useQueryClient } from '@tanstack/react-query';
import bffService from '../../services/bffService';

// Cache helpers
const CACHE_KEY = 'tymout_bff_explore_cache';

/**
 * Save explore page data to localStorage
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 */
const saveToCache = (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Get cached explore page data from localStorage
 * @param {string} key - Cache key
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {Object|null} - Cached data or null if expired/not found
 */
const getFromCache = (key, maxAge = 5 * 60 * 1000) => { // Default 5 minutes
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > maxAge;
    
    return isExpired ? null : data;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
};

/**
 * Custom hook for fetching all explore page data in a single request
 * 
 * @param {Object} initialFilters - Initial filter state
 * @returns {Object} - Query state and handlers
 */
export const useExplorePage = (initialFilters = {}) => {
  const queryClient = useQueryClient();
  
  // Create a stable cache key based on filters
  const cacheKey = `${CACHE_KEY}_${JSON.stringify(initialFilters)}`;
  
  // Fetch all explore page data with current filters
  const query = useQuery({
    queryKey: ['explorePage', initialFilters],
    queryFn: async () => {
      const data = await bffService.getExplorePageData(initialFilters);
      // Save successful response to cache
      saveToCache(cacheKey, data);
      return data;
    },
    // Enhanced caching options
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    initialData: () => getFromCache(cacheKey),
    onSuccess: (data) => {
      // Update cache on successful fetch
      saveToCache(cacheKey, data);
    },
  });
  
  // Optimized handler for updating filters
  const updateFilters = (newFilters) => {
    const mergedFilters = { ...initialFilters, ...newFilters };
    // Create a stable cache key for prefetching
    const cacheKey = `${CACHE_KEY}_${JSON.stringify(mergedFilters)}`;
    
    // Prefetch the data with new filters
    queryClient.prefetchQuery({
      queryKey: ['explorePage', mergedFilters],
      queryFn: async () => {
        const data = await bffService.getExplorePageData(mergedFilters);
        // Save prefetched data to cache
        saveToCache(cacheKey, data);
        return data;
      },
    });
  };
  
  return {
    ...query,
    updateFilters,
  };
};

export default useExplorePage;
