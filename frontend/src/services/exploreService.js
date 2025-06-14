import axios from 'axios';
import { 
  tablesData, 
  eventsData, 
  circlesData 
} from '../data/mockExploreData';
import { isPast } from 'date-fns';

/**
 * Explore Service
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all explore-related API calls
 * - Each function handles a specific type of data fetch
 * - Mock implementation is provided for development
 */
const exploreService = {
  /**
   * Get all explore items with optional filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Array>} - Array of explore items
   */
  getExploreItems: async (params = {}) => {
    // Directly call the Event microservice backend, bypassing the API gateway
    // URL: http://localhost:3002/events
    try {
      console.log('Calling event service with params:', params);
      
      // Create a new params object to handle special cases
      const apiParams = { ...params };
      
      // Handle "Only For You" feature
      if (params.view === 'Only For You' && params.userInterests) {
        console.log('Sending user interests to backend for personalized results:', params.userInterests);
        // Ensure userInterests is properly formatted
        if (Array.isArray(params.userInterests)) {
          apiParams.userInterests = params.userInterests;
        } else if (typeof params.userInterests === 'string') {
          // If it's a string, convert to array
          apiParams.userInterests = params.userInterests.split(',');
        }
      }
      
      // Ensure tags are properly formatted for the API
      if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
        // Keep as is - the backend expects an array
        console.log('Sending tags to backend:', params.tags);
      }
      
      const response = await axios.get(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/search`, { params: apiParams });
      // Handle the response format from the backend which returns { success: true, data: events }
      const events = response.data.data || [];
      
      // Filter out private events and past events - they shouldn't appear in explore
      let filteredEvents = events.filter(event => {
        // Check if the event is public
        const isPublic = event.access === 'public';
        
        // Check if the event is in the past
        const isPastEvent = event.date && event.date.start ? isPast(new Date(event.date.start)) : false;
        
        // Only include public events that are not in the past
        return isPublic && !isPastEvent;
      });
      
      // Apply time-based filtering if specified
      if (params.timeFilter && params.timeFilter !== 'all') {
        console.log(`Applying time filter: ${params.timeFilter}`);
        
        filteredEvents = filteredEvents.filter(event => {
          // Skip events without date information
          if (!event.date || !event.date.start) return false;
          
          const eventDate = new Date(event.date.start);
          const today = new Date();
          
          if (params.timeFilter === 'today') {
            // Check if event is today
            return eventDate.getDate() === today.getDate() &&
              eventDate.getMonth() === today.getMonth() &&
              eventDate.getFullYear() === today.getFullYear();
          } 
          else if (params.timeFilter === 'thisWeek') {
            // Check if event is within the current week (Sunday to Saturday)
            const dayOfWeek = today.getDay();
            
            // Calculate the start and end of the current week
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
            endOfWeek.setHours(23, 59, 59, 999);
            
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
          }
          
          return true;
        });
      }
      
      // Transform MongoDB data format to match what the frontend components expect
      return filteredEvents.map(event => {
        // Format date from MongoDB date object to string
        const startDate = event.date?.start ? new Date(event.date.start) : new Date();
        const formattedDate = startDate.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'short', day: 'numeric' 
        });

        // Format location from object to string
        const locationStr = event.location?.city || 'Unknown Location';
        
        return {
          ...event,
          id: event._id, // Add id field based on MongoDB's _id
          type: event.type || 'event',
          // Don't set a default image - EventCard component should handle missing images
          image: event.image || null,
          // Convert location object to string as expected by EventCard
          location: locationStr,
          // Format date as expected by EventCard
          date: formattedDate,
          // Add other required fields with defaults
          participants: event.attendees?.length || 0,
          maxParticipants: event.capacity || event.maxAttendees || 10,
          tags: event.tags || [],
          // Ensure host is properly formatted with default image
          host: {
            id: event.host?.userId || 'unknown',
            name: event.host?.name || 'Anonymous Host',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(event.host?.name || 'User')}&background=random&color=fff&size=128`
          }
        };
      });
    } catch (error) {
      console.error('Error fetching explore data directly from event service:', error);
      throw error;
    }
  },
  
  /**
   * Get details for a specific explore item
   * @param {string} id - Item ID
   * @param {string} type - Item type (event, table, circle)
   * @returns {Promise<Object>} - Item details
   */
  getItemDetails: async (id, type) => {
    try {
      // Uncomment for production API call
      // const response = await axios.get(`/api/${type}s/${id}`);
      // return response.data;
      
      // Mock implementation
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the item in the appropriate mock data array
      let item;
      
      switch (type) {
        case 'table':
          item = tablesData.find(t => t.id === id);
          break;
        case 'circle':
          item = circlesData.find(c => c.id === id);
          break;
        case 'event':
        default:
          item = eventsData.find(e => e.id === id);
          break;
      }
      
      if (!item) {
        throw new Error(`Item not found: ${type} ${id}`);
      }
      
      return { ...item, type };
    } catch (error) {
      console.error(`Error fetching ${type} details:`, error);
      throw error;
    }
  }
};

export default exploreService;
