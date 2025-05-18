import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import eventDetailService from '../../services/eventDetailService';
import eventService from '../../services/eventService';

/**
 * Custom hook for fetching event details
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @param {string} type - The type of item (events, tables, circles)
 * @param {string} id - The ID of the item
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useEventDetail = (type, id, options = {}) => {
  return useQuery({
    queryKey: ['eventDetail', type, id],
    queryFn: async () => {
      // Use the real-time event service for events
      // Note: The type from URL params is 'events' (plural) as defined in App.js routes
      if (type === 'events' || type === 'event') {
        try {
          return await eventService.getEventById(id);
        } catch (error) {
          console.error('Error fetching event details:', error);
          throw new Error('Failed to load event details. Please try again.');
        }
      } else {
        // Use the existing service for other types
        return eventDetailService.getItemDetails(type, id);
      }
    },
    enabled: !!type && !!id,
    ...options
  });
};

/**
 * Custom hook for taking action on an event (RSVP, join, apply)
 * Includes optimistic updates for better UX
 * 
 * @param {string} type - The type of item (events, tables, circles)
 * @param {Object} options - React Query options
 * @returns {Object} - React Query mutation object
 */
export const useEventAction = (type, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, action }) => eventDetailService.takeAction(type, id, action),
    
    // When mutate is called:
    onMutate: async ({ id, action }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['eventDetail', type, id] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['eventDetail', type, id]);
      
      // Optimistically update the UI
      queryClient.setQueryData(['eventDetail', type, id], old => {
        if (!old) return old;
        
        // Create optimistic update based on action type
        const newData = { ...old };
        
        if (action === 'rsvp') {
          newData.isRsvpd = true;
          newData.attendeeCount = (newData.attendeeCount || 0) + 1;
        } else if (action === 'join') {
          // For events, we should set isRequested to true instead of isJoined
          // since joining an event requires approval
          if (type === 'events') {
            newData.isRequested = true;
            // Don't change isJoined status as that happens after approval
          } else {
            // For tables, we can join directly
            newData.isJoined = true;
            newData.memberCount = (newData.memberCount || 0) + 1;
          }
        } else if (action === 'apply') {
          newData.isApplied = true;
        }
        
        return newData;
      });
      
      // Return the snapshot to use in case of rollback
      return { previousData };
    },
    
    // If the mutation fails, use the snapshot to rollback
    onError: (err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['eventDetail', type, id], context.previousData);
      }
      console.error('Error taking action:', err);
    },
    
    // Always refetch after mutation to ensure data is in sync
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['eventDetail', type, id] });
    },
    
    ...options
  });
};

/**
 * Custom hook for cancelling an action on an event (cancel RSVP, leave, withdraw)
 * Includes optimistic updates for better UX
 * 
 * @param {string} type - The type of item (events, tables, circles)
 * @param {Object} options - React Query options
 * @returns {Object} - React Query mutation object
 */
export const useCancelEventAction = (type, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, action }) => eventDetailService.cancelAction(type, id, action),
    
    // When mutate is called:
    onMutate: async ({ id, action }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['eventDetail', type, id] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['eventDetail', type, id]);
      
      // Optimistically update the UI
      queryClient.setQueryData(['eventDetail', type, id], old => {
        if (!old) return old;
        
        // Create optimistic update based on action type
        const newData = { ...old };
        
        if (action === 'rsvp') {
          newData.isRsvpd = false;
          newData.attendeeCount = Math.max(0, (newData.attendeeCount || 1) - 1);
        } else if (action === 'join') {
          // For events, we need to handle both isJoined and isRequested
          if (type === 'events') {
            // Reset both flags since we're cancelling any participation
            newData.isJoined = false;
            newData.isRequested = false;
            // Only reduce member count if they were actually joined
            if (old.isJoined) {
              newData.memberCount = Math.max(0, (newData.memberCount || 1) - 1);
            }
          } else {
            // For tables, just handle isJoined
            newData.isJoined = false;
            newData.memberCount = Math.max(0, (newData.memberCount || 1) - 1);
          }
        } else if (action === 'apply') {
          newData.isApplied = false;
        }
        
        return newData;
      });
      
      // Return the snapshot for rollback
      return { previousData };
    },
    
    // If the mutation fails, use the snapshot to rollback
    onError: (err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['eventDetail', type, id], context.previousData);
      }
      console.error('Error cancelling action:', err);
    },
    
    // Always refetch after mutation to ensure data is in sync
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['eventDetail', type, id] });
    },
    
    ...options
  });
};
