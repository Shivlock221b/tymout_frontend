// useEventTabsQuery.js
// React Query hook for fetching event tabs
import { useQuery } from '@tanstack/react-query';
import { getEventTabs } from '../../services/eventTabsService';

export function useEventTabsQuery() {
  return useQuery({
    queryKey: ['eventTabs'],
    queryFn: getEventTabs
  });
}
