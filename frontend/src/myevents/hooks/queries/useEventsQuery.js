// useEventsQuery.js
// React Query hook for fetching events
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../../services/eventsService';

export function useEventsQuery() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });
}
