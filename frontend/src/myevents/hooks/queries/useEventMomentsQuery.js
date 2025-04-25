// useEventMomentsQuery.js
// React Query hook for fetching event moments/photos
import { useQuery } from '@tanstack/react-query';
import { getEventMoments } from '../services/momentsService';

export function useEventMomentsQuery(eventId) {
  return useQuery({
    queryKey: ['eventMoments', eventId],
    queryFn: () => getEventMoments(eventId),
    enabled: !!eventId,
  });
}
