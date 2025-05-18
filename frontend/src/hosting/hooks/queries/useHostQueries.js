import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hostService from '../../services/hostService';

/**
 * Custom hook for creating events with image upload support
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @returns {Object} React Query mutation object
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventData, imageFile }) => {
      console.log('[useCreateEvent] Creating event with image:', !!imageFile);
      if (imageFile) {
        console.log('[useCreateEvent] Image file details:', { 
          name: imageFile.name, 
          type: imageFile.type, 
          size: imageFile.size 
        });
      } else {
        console.log('[useCreateEvent] No image file provided');
      }
      console.log('[useCreateEvent] Event data:', eventData);
      return hostService.createEvent(eventData, imageFile);
    },
    
    onSuccess: (data) => {
      console.log('[useCreateEvent] Event created successfully:', data);
      
      // Invalidate host events queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['hostEvents'] });
      
      // Invalidate explore queries to ensure the new event appears in explore page
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      
      // Add the new event to the cache if it exists
      if (data && data.id) {
        queryClient.setQueryData(['event', data.id], data);
      }
    },
    
    onError: (error) => {
      console.error('[useCreateEvent] Error creating event:', error);
    }
  });
};

/**
 * Custom hook for updating events
 * 
 * @returns {Object} React Query mutation object
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, eventData }) => 
      hostService.updateEvent(eventId, eventData),
    
    onSuccess: (data) => {
      // Update the event in the cache
      queryClient.setQueryData(['event', data.id], data);
      
      // Invalidate host events queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['hostEvents'] });
    }
  });
};

/**
 * Custom hook for canceling events
 * 
 * @returns {Object} React Query mutation object
 */
export const useCancelEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId) => hostService.cancelEvent(eventId),
    
    onMutate: async (eventId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['event', eventId] });
      
      // Snapshot the current value
      const previousEvent = queryClient.getQueryData(['event', eventId]);
      
      // Optimistically update the event
      queryClient.setQueryData(['event', eventId], old => {
        return old ? { ...old, status: 'canceled' } : old;
      });
      
      // Optimistically update the host events list
      queryClient.setQueryData(['hostEvents'], old => {
        if (!old) return old;
        
        return old.map(event => {
          if (event.id === eventId) {
            return { ...event, status: 'canceled' };
          }
          return event;
        });
      });
      
      // Return the snapshot
      return { previousEvent };
    },
    
    onError: (err, eventId, context) => {
      // Roll back on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['event', eventId], context.previousEvent);
      }
    },
    
    onSettled: (data, error, eventId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['hostEvents'] });
    }
  });
};

/**
 * Custom hook for fetching available locations
 * 
 * @param {Object} options - React Query options
 * @returns {Object} React Query result object
 */
export const useLocations = (options = {}) => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: hostService.getLocations,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};

/**
 * Custom hook for fetching event templates
 * 
 * @param {Object} options - React Query options
 * @returns {Object} React Query result object
 */
export const useEventTemplates = (options = {}) => {
  return useQuery({
    queryKey: ['eventTemplates'],
    queryFn: hostService.getEventTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
};
