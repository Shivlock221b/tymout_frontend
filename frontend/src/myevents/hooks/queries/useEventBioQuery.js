// useEventBioQuery.js
// React Query hook for fetching event bio/description
import { useQuery } from '@tanstack/react-query';
import { getEventBio } from '../../services/eventBioService';

export function useEventBioQuery(eventId) {
  return useQuery({
    queryKey: ['eventBio', eventId],
    queryFn: () => getEventBio(eventId),
    enabled: !!eventId,
  });
}
