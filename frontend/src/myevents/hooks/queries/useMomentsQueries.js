// useMomentsQueries.js
// React Query hooks for event moments
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventMoments, uploadEventMoment } from '../../services/momentsService';

/**
 * Hook to fetch event moments/photos
 * @param {string} eventId - The event ID
 * @returns {Object} Query result with data, isLoading, and error
 */
export function useEventMomentsQuery(eventId) {
  return useQuery({
    queryKey: ['eventMoments', eventId],
    queryFn: () => getEventMoments(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to upload a moment/photo to an event
 * @returns {Object} Mutation result with mutate function
 */
export function useUploadEventMoment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, imageFile }) => uploadEventMoment(eventId, imageFile),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh the moments list
      queryClient.invalidateQueries({ queryKey: ['eventMoments', variables.eventId] });
    },
  });
}
