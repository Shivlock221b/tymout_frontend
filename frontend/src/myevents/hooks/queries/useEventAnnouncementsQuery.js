// useEventAnnouncementsQuery.js
// React Query hook for fetching event announcements
import { useQuery } from '@tanstack/react-query';
import { getEventAnnouncements } from '../../services/announcementsService';

export function useEventAnnouncementsQuery(eventId) {
  return useQuery({
    queryKey: ['eventAnnouncements', eventId],
    queryFn: () => getEventAnnouncements(eventId),
    enabled: !!eventId,
  });
}
