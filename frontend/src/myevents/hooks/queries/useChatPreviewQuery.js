import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';

// Configure service URL with better fallback handling for production
const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3020');

// Log the configured URL for debugging
console.log('Chat service URL configured as:', SOCKET_URL);

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
      console.log('Fetching chat previews for events:', eventIds, 'userId:', userId);
      console.log('Using API URL:', API_URL);
      
      // Configure axios with timeout and headers
      const axiosConfig = {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      // Fetch last messages for each event
      const previewPromises = eventIds.map(eventId => {
        const url = `${API_URL}/chat-preview/${eventId}?userId=${userId}`;
        console.log('Fetching chat preview from:', url);
        return axios.get(url, axiosConfig);
      });
      
      const results = await Promise.all(previewPromises);
      console.log('DEBUG useChatPreviews API results:', results);
      
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
        console.log(`Chat preview for event ${eventId}:`, previewData);
        
        acc[eventId] = previewData;
        return acc;
      }, {});
      
      // Store the latest results in localStorage as a fallback
      try {
        localStorage.setItem('chat-previews', JSON.stringify({
          timestamp: new Date().toISOString(),
          data: chatPreviews
        }));
      } catch (e) {
        console.warn('Failed to store chat previews in localStorage:', e);
      }
      
      return chatPreviews;
    } catch (error) {
      console.error("Error fetching chat previews:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Try to use cached data from localStorage as fallback
      try {
        const cached = localStorage.getItem('chat-previews');
        if (cached) {
          const parsedCache = JSON.parse(cached);
          console.log('Using cached chat previews from:', parsedCache.timestamp);
          return parsedCache.data;
        }
      } catch (e) {
        console.warn('Failed to retrieve cached chat previews:', e);
      }
      
      return {};
    }
  };

  // Main query to fetch all chat previews
  const { data: chatPreviews = {}, isLoading } = useQuery({
    queryKey: ['chatPreviews', eventIds.sort().join(','), userId],
    queryFn: fetchChatPreviews,
    enabled: Boolean(eventIds.length && userId),
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 60000, // Poll every minute as a fallback for socket issues
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onError: (error) => {
      console.error('Chat preview query error:', error);
    }
  });

  return { chatPreviews, isLoading };
}

// Hook for a single event's chat preview
export function useChatPreview(eventId) {
  const { chatPreviews, isLoading } = useChatPreviews(eventId ? [eventId] : []);
  return { preview: chatPreviews[eventId] || {}, isLoading };
}
