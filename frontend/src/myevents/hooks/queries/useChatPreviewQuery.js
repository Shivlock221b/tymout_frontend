import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';

const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';
const API_URL = `${SOCKET_URL}/api/messages`;

/**
 * Custom hook to get chat preview data (last message and unread count) for each event
 * @param {Array} eventIds - Array of event IDs to fetch chat previews for
 * @returns {Object} - Object containing chatPreviews and isLoading state
 */
export function useChatPreviews(eventIds = []) {
  const user = useAuthStore(state => state.user);
  const userId = user?._id;

  // Function to fetch chat preview data (last message and unread count)
  const fetchChatPreviews = async () => {
    if (!eventIds.length || !userId) return {};
    
    try {
      // Fetch last messages for each event
      const previewPromises = eventIds.map(eventId => 
        axios.get(`${API_URL}/preview/${eventId}?userId=${userId}`)
      );
      
      const results = await Promise.all(previewPromises);
      
      // Transform results into a map of eventId -> preview data
      const chatPreviews = results.reduce((acc, res, index) => {
        const eventId = eventIds[index];
        
        // Default preview data
        const defaultPreview = {
          lastMessage: null,
          unreadCount: 0,
          lastMessageTime: null,
          lastSenderName: null
        };
        
        // Extract data from response or use defaults
        const previewData = res.data || defaultPreview;
        
        acc[eventId] = previewData;
        return acc;
      }, {});
      
      return chatPreviews;
    } catch (error) {
      console.error("Error fetching chat previews:", error);
      return {};
    }
  };

  // Main query to fetch all chat previews
  const { data: chatPreviews = {}, isLoading } = useQuery({
    queryKey: ['chatPreviews', eventIds.sort().join(','), userId],
    queryFn: fetchChatPreviews,
    enabled: Boolean(eventIds.length && userId),
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 30000, // Poll every 30 seconds
  });

  return { chatPreviews, isLoading };
}

// Hook for a single event's chat preview
export function useChatPreview(eventId) {
  const { chatPreviews, isLoading } = useChatPreviews(eventId ? [eventId] : []);
  return { preview: chatPreviews[eventId] || {}, isLoading };
}
