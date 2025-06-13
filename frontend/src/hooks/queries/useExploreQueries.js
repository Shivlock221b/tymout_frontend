import { useQuery, useQueryClient } from '@tanstack/react-query';
import exploreService from '../../services/exploreService';

// Cache helpers
const CACHE_KEY = 'tymout_explore_cache';

/**
 * Save explore data to localStorage
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
 * Get cached explore data from localStorage
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
 * Custom hook for fetching explore items with optional filters
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @param {Object} filters - Filtering parameters (query, tags, distance, sortBy)
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useExploreItems = (filters = {}, options = {}) => {
  // Create a stable cache key based on filters
  const cacheKey = `${CACHE_KEY}_${JSON.stringify(filters)}`;
  
  return useQuery({
    queryKey: ['explore', filters],
    queryFn: async () => {
      const data = await exploreService.getExploreItems(filters);
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
    ...options
  });
};

/**
 * Custom hook for fetching a specific explore item's details
 * 
 * @param {string} id - Item ID
 * @param {string} type - Item type (event, table, circle)
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useExploreItemDetails = (id, type, options = {}) => {
  return useQuery({
    queryKey: ['explore', type, id],
    queryFn: () => exploreService.getItemDetails(id, type),
    enabled: !!id && !!type,
    ...options
  });
};

/**
 * Custom hook for managing explore search state with React Query
 * This separates the concern of pagination from data fetching
 * 
 * @param {Object} initialFilters - Initial filter state
 * @returns {Object} - Query state and handlers
 */
export const useExploreSearch = (initialFilters = {}) => {
  const queryClient = useQueryClient();
  
  // Detect if we're on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Fetch explore items with current filters
  const query = useExploreItems(initialFilters, {
    keepPreviousData: true,
    // For mobile devices, reduce stale time and increase retry attempts
    staleTime: isMobile ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute on mobile
    retry: isMobile ? 2 : 1,
    retryDelay: 1000,
  });
  
  // Optimized handler for updating filters that prevents unnecessary re-renders
  const updateFilters = (newFilters) => {
    console.log('Updating filters:', newFilters, 'Device:', isMobile ? 'Mobile' : 'Desktop');
    const mergedFilters = { ...initialFilters, ...newFilters };
    // Create a stable cache key for prefetching
    const cacheKey = `${CACHE_KEY}_${JSON.stringify(mergedFilters)}`;
    
    // For mobile, force refetch instead of just prefetching
    if (isMobile && newFilters.refresh) {
      console.log('Force refreshing data on mobile');
      queryClient.invalidateQueries(['explore', initialFilters]);
      return;
    }
    
    // Prefetch the data with new filters
    queryClient.prefetchQuery({
      queryKey: ['explore', mergedFilters],
      queryFn: async () => {
        console.log('Prefetching data with filters:', mergedFilters);
        const data = await exploreService.getExploreItems(mergedFilters);
        console.log('Prefetched data:', data ? data.length : 0, 'items');
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
