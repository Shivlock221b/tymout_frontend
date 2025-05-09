import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Custom hook to fetch events hosted by a specific user
 * @param {string} userId - The ID of the user whose hosted events to fetch
 * @returns {Object} Query result with data, isLoading, and error
 */
export const useUserHostedEvents = (userId) => {
  return useQuery({
    queryKey: ['userHostedEvents', userId],
    queryFn: async () => {
      try {
        // Get the API URL from environment variables or use default
        const apiUrl = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002';
        
        // Make the API request to fetch events hosted by the user
        const response = await axios.get(`${apiUrl}/events/host/${userId}`);
        
        // Log the response for debugging
        console.log('User hosted events response:', response.data);
        
        // Return the events data
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching user hosted events:', error);
        throw error;
      }
    },
    enabled: !!userId, // Only run the query if userId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
