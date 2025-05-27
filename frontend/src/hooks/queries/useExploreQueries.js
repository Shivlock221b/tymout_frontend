import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import exploreService from '../../services/exploreService';

/**
 * Custom hook for fetching explore items with optional filters
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @param {Object} filters - Filtering parameters (query, tags, distance, sortBy)
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useExploreItems = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['explore', filters],
    queryFn: () => exploreService.getExploreItems(filters),
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
  
  // Fetch explore items with current filters
  const query = useExploreItems(initialFilters, {
    keepPreviousData: true,
  });
  
  // Optimized handler for updating filters that prevents unnecessary re-renders
  const updateFilters = (newFilters) => {
    // Prefetch the data with new filters
    queryClient.prefetchQuery({
      queryKey: ['explore', { ...initialFilters, ...newFilters }],
      queryFn: () => exploreService.getExploreItems({ ...initialFilters, ...newFilters }),
    });
  };
  
  return {
    ...query,
    updateFilters,
  };
};
