/**
 * Experience React Query Hooks
 * Provides React Query hooks for Experience data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import experienceService from '../services/experienceService';
import { mockExperiences } from '../data/mockExperienceData';

/**
 * Hook to fetch all experiences with filters
 * @param {Object} filters - Filter parameters
 * @param {Object} options - Additional React Query options
 * @returns {Object} - Query results
 */
export const useExperiences = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['experiences', filters],
    queryFn: () => experienceService.getAllExperiences(filters),
    // For development, return mock data while API is in progress
    placeholderData: mockExperiences, 
    // Default stale time
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Default is true, experiences will refetch on window focus
    refetchOnWindowFocus: true,
    // Override with any provided options
    ...options
  });
};

/**
 * Hook to fetch a single experience by ID
 * @param {string} id - Experience ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} - Query results
 */
export const useExperience = (id, options = {}) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: () => experienceService.getExperienceById(id),
    // For development, find from mock data while API is in progress
    placeholderData: () => mockExperiences.find(exp => exp.id === id),
    // Only fetch if id is provided
    enabled: !!id,
    // Default stale time
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Override with any provided options
    ...options
  });
};

/**
 * Hook to fetch experiences by host ID
 * @param {string} hostId - Host ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} - Query results
 */
export const useHostExperiences = (hostId, options = {}) => {
  return useQuery({
    queryKey: ['host', hostId, 'experiences'],
    queryFn: () => experienceService.getExperiencesByHost(hostId),
    // For development, filter mock data while API is in progress
    placeholderData: () => mockExperiences.filter(exp => exp.host.id === hostId),
    // Only fetch if hostId is provided
    enabled: !!hostId,
    // Override with any provided options
    ...options
  });
};

/**
 * Hook to fetch user's booked experiences
 * @param {string} userId - User ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} - Query results
 */
export const useUserBookings = (userId, options = {}) => {
  return useQuery({
    queryKey: ['user', userId, 'bookings'],
    queryFn: () => experienceService.getUserBookings(userId),
    // Only fetch if userId is provided
    enabled: !!userId,
    // Override with any provided options
    ...options
  });
};

/**
 * Hook to create a new experience
 * @returns {Object} - Mutation object with mutate function
 */
export const useCreateExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (experienceData) => experienceService.createExperience(experienceData),
    onSuccess: (data) => {
      // Invalidate experiences query to refetch
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      
      // If host experiences were fetched, invalidate those too
      if (data.host && data.host.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['host', data.host.id, 'experiences'] 
        });
      }
    }
  });
};

/**
 * Hook to update an existing experience
 * @returns {Object} - Mutation object with mutate function
 */
export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => experienceService.updateExperience(id, data),
    onSuccess: (data) => {
      // Invalidate specific experience query
      queryClient.invalidateQueries({ 
        queryKey: ['experience', data.id] 
      });
      
      // Invalidate experiences list
      queryClient.invalidateQueries({ 
        queryKey: ['experiences'],
        exact: false 
      });
      
      // If host experiences were fetched, invalidate those too
      if (data.host && data.host.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['host', data.host.id, 'experiences'] 
        });
      }
    }
  });
};

/**
 * Hook to delete an experience
 * @returns {Object} - Mutation object with mutate function
 */
export const useDeleteExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => experienceService.deleteExperience(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['experience', id] });
      
      // Invalidate experiences list
      queryClient.invalidateQueries({ 
        queryKey: ['experiences'],
        exact: false 
      });
      
      // Note: We would also invalidate host experiences, but we don't have
      // the host ID in this context, so all host experience lists are invalidated
      queryClient.invalidateQueries({ 
        queryKey: ['host'],
        predicate: (query) => query.queryKey[2] === 'experiences'
      });
    }
  });
};

/**
 * Hook to book an experience
 * @returns {Object} - Mutation object with mutate function
 */
export const useBookExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ experienceId, bookingData }) => 
      experienceService.bookExperience(experienceId, bookingData),
    onSuccess: (data) => {
      // Invalidate experience to update availability
      queryClient.invalidateQueries({ 
        queryKey: ['experience', data.experienceId] 
      });
      
      // Invalidate user bookings
      queryClient.invalidateQueries({ 
        queryKey: ['user', 'bookings'],
        exact: false 
      });
      
      // Invalidate availability data if it exists
      queryClient.invalidateQueries({
        queryKey: ['experience', data.experienceId, 'availability'],
        exact: false
      });
    }
  });
};

/**
 * Hook to get available slots for an experience
 * @param {string} experienceId - Experience ID
 * @param {string} date - Date to check (YYYY-MM-DD)
 * @param {Object} options - Additional React Query options
 * @returns {Object} - Query results
 */
export const useExperienceAvailability = (experienceId, date, options = {}) => {
  return useQuery({
    queryKey: ['experience', experienceId, 'availability', date],
    queryFn: () => experienceService.getAvailableSlots(experienceId, date),
    // Only fetch if both params are provided
    enabled: !!experienceId && !!date,
    // Shorter stale time for availability data
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Override with any provided options
    ...options
  });
};
