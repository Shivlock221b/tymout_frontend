import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import myEventsService from '../../services/myEventsService';
import { useAuthStore } from '../../../stores/authStore';

/**
 * Hook to fetch all events related to the current user (both hosting and attending)
 * @returns {Object} Query result with data, isLoading, and error
 */
export const useMyEvents = () => {
  const { user } = useAuthStore();
  const userId = user?._id;

  return useQuery({
    queryKey: ['myEvents', userId],
    queryFn: () => myEventsService.getMyEvents(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch events the user is attending but not hosting
 * @returns {Object} Query result with data, isLoading, and error
 */
export const useEventsAttending = () => {
  const { user } = useAuthStore();
  const userId = user?._id;

  return useQuery({
    queryKey: ['eventsAttending', userId],
    queryFn: () => myEventsService.getEventsAttending(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch events the user is hosting
 * @returns {Object} Query result with data, isLoading, and error
 */
export const useHostedEvents = () => {
  const { user } = useAuthStore();
  const userId = user?._id;

  return useQuery({
    queryKey: ['hostedEvents', userId],
    queryFn: () => myEventsService.getHostedEvents(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch pending join requests for a specific event
 * @param {string} eventId - The event's ID
 * @returns {Object} Query result with data, isLoading, and error
 */
export const useEventPendingRequests = (eventId) => {
  return useQuery({
    queryKey: ['eventPendingRequests', eventId],
    queryFn: () => myEventsService.getEventPendingRequests(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter stale time for requests)
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch all pending join requests for events hosted by the current user
 * @returns {Object} Query result with data, isLoading, and error
 */
export const usePendingJoinRequests = () => {
  const { user } = useAuthStore();
  const userId = user?._id;

  return useQuery({
    queryKey: ['pendingJoinRequests', userId],
    queryFn: () => myEventsService.getPendingJoinRequests(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to approve a join request
 * @returns {Object} Mutation result with mutate function
 */
export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, requestId }) => myEventsService.approveJoinRequest(eventId, requestId),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['eventPendingRequests', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequests'] });
      queryClient.invalidateQueries({ queryKey: ['hostedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });
};

/**
 * Hook to reject a join request
 * @returns {Object} Mutation result with mutate function
 */
export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, requestId }) => myEventsService.rejectJoinRequest(eventId, requestId),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['eventPendingRequests', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequests'] });
    },
  });
};
