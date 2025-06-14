import { useQuery } from '@tanstack/react-query';
import homeService from '../../services/homeService';

/**
 * Custom hook for fetching featured tables
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useFeaturedTables = (options = {}) => {
  return useQuery({
    queryKey: ['featuredTables'],
    queryFn: homeService.getFeaturedTables,
    // Enable stale-while-revalidate pattern
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options
  });
};

/**
 * Custom hook for fetching the home feed data
 * Includes recommendations, upcoming events, and popular circles
 * 
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useHomeFeed = (options = {}) => {
  return useQuery({
    queryKey: ['homeFeed'],
    queryFn: homeService.getHomeFeed,
    // Enable stale-while-revalidate pattern
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    ...options
  });
};

/**
 * Custom hook for prefetching home page data
 * Useful for preloading data before navigation to the home page
 * 
 * @param {Object} queryClient - React Query client instance
 */
export const prefetchHomeData = async (queryClient) => {
  // Prefetch featured tables
  await queryClient.prefetchQuery({
    queryKey: ['featuredTables'],
    queryFn: homeService.getFeaturedTables,
    staleTime: 5 * 60 * 1000
  });
  
  // Prefetch home feed
  await queryClient.prefetchQuery({
    queryKey: ['homeFeed'],
    queryFn: homeService.getHomeFeed,
    staleTime: 3 * 60 * 1000
  });
};
