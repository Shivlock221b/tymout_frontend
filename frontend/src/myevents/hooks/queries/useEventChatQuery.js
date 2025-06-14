// useEventChatQuery.js
// React Query hook for fetching chat messages for an event
import { useQuery } from '@tanstack/react-query';
import { getEventChat } from '../services/chatService';

// The backend returns an array of message objects for the event
// The backend returns an array of message objects for the event
export function useEventChatQuery(eventId) {
  return useQuery({
    queryKey: ['eventChat', eventId],
    queryFn: () => getEventChat(eventId),
    enabled: !!eventId,
  });
}
