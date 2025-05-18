// useEventMembersQuery.js
// React Query hook for fetching event members
import { useQuery } from '@tanstack/react-query';
import { getEventMembers } from '../../services/membersService';

export function useEventMembersQuery(eventId) {
  return useQuery({
    queryKey: ['eventMembers', eventId],
    queryFn: () => getEventMembers(eventId),
    enabled: !!eventId,
  });
}
