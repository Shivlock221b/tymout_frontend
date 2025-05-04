import { 
  tablesData, 
  eventsData, 
  circlesData 
} from '../data/mockExploreData';
import { personalizedEventsData } from '../data/mockPersonalizedData';

/**
 * EventDetail Service
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all event detail related API calls
 * - Each function handles a specific operation
 * - Mock implementation is provided for development
 */
const eventDetailService = {
  /**
   * Get details of a specific item by type and ID
   * @param {string} type - The type of item (events, tables, circles)
   * @param {string} id - The ID of the item
   * @returns {Promise<Object>} - The item details
   */
  getItemDetails: async (type, id) => {
    try {
      // In a production environment, this would be an API call
      // const response = await axios.get(`/api/${type}/${id}`);
      // return response.data;
      
      // Using mock data for development
      let foundItem = null;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Search in different data sources based on type
      switch (type) {
        case 'tables':
          foundItem = tablesData.find(item => item.id === id);
          break;
        case 'events':
          foundItem = eventsData.find(item => item.id === id);
          // If not found in explore events, check personalized events
          if (!foundItem) {
            foundItem = personalizedEventsData.find(item => item.id === id);
          }
          break;
        case 'circles':
          foundItem = circlesData.find(item => item.id === id);
          break;
        default:
          // If type is not specified, search all data sources
          foundItem = 
            tablesData.find(item => item.id === id) ||
            eventsData.find(item => item.id === id) ||
            circlesData.find(item => item.id === id) ||
            personalizedEventsData.find(item => item.id === id);
      }
      
      if (foundItem) {
        return { ...foundItem, itemType: type };
      } else {
        throw new Error(`Item not found: ${type} ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching ${type} with id ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Take action on an item (RSVP, join, apply, etc.)
   * @param {string} type - The type of item (events, tables, circles)
   * @param {string} id - The ID of the item
   * @param {string} action - The action to take (rsvp, join, apply)
   * @returns {Promise<Object>} - The result of the action
   */
  takeAction: async (type, id, action) => {
    try {
      // For events, use the real API endpoint
      if (type === 'events' && action === 'join') {
        // Import dynamically to avoid circular dependencies
        const eventService = (await import('./eventService')).default;
        
        // Get user data directly from the user service
        let userData = { userId: '', name: '' };
        
        try {
          // Make a direct API call to get current user data
          const token = localStorage.getItem('auth-storage') ? 
            JSON.parse(localStorage.getItem('auth-storage'))?.state?.token : null;
          
          if (token) {
            console.log('[eventDetailService] Found token, fetching current user data');
            
            // Import axios dynamically
            const axios = (await import('axios')).default;
            
            // Make a request to get current user data
            const response = await axios.get(
              `${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000'}/api/users/current`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data && response.data.data) {
              const user = response.data.data;
              console.log('[eventDetailService] Got user data from API:', user);
              
              userData = {
                userId: user._id,
                name: user.name || ''
              };
            }
          }
        } catch (e) {
          console.error('[eventDetailService] Error fetching current user:', e);
          
          // Fallback to localStorage
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const authState = JSON.parse(authStorage);
              if (authState?.state?.user) {
                userData = {
                  userId: authState.state.user._id,
                  name: authState.state.user.name || ''
                };
              }
            }
          } catch (storageError) {
            console.error('[eventDetailService] Error reading from localStorage:', storageError);
          }
        }
        
        // Final fallback
        if (!userData.userId) {
          userData.userId = localStorage.getItem('userId') || '1';
        }
        
        console.log('[eventDetailService] Joining event with user data:', userData);
        
        try {
          const result = await eventService.joinEvent(id, userData);
          
          // Make sure the isRequested flag is set in the result
          const updatedData = {
            ...result,
            isRequested: true // Ensure this flag is set for optimistic UI updates
          };
          
          return {
            success: true,
            message: 'Your request to join this event has been sent to the host.',
            data: updatedData,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          // If the error is because the user already requested to join,
          // we want to treat this as a success with isRequested=true
          if (error.response && 
              error.response.status === 400 && 
              error.response.data?.error?.includes('already requested')) {
            
            console.log('[eventDetailService] User has already requested to join this event');
            
            return {
              success: true,
              message: 'You have already requested to join this event.',
              data: {
                id,
                isRequested: true
              },
              timestamp: new Date().toISOString()
            };
          }
          
          // Otherwise, re-throw the error
          throw error;
        }
      }
      
      // For other types, use mock implementation for now
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock success response
      const actionVerb = 
        action === 'rsvp' ? 'RSVP\'d to' : 
        action === 'join' ? 'joined' : 
        'applied to';
      
      return {
        success: true,
        message: `You have successfully ${actionVerb} this ${type.slice(0, -1)}!`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error taking action ${action} on ${type} with id ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Cancel an action on an item (cancel RSVP, leave, withdraw, etc.)
   * @param {string} type - The type of item (events, tables, circles)
   * @param {string} id - The ID of the item
   * @param {string} action - The action to cancel (rsvp, join, apply)
   * @returns {Promise<Object>} - The result of the cancellation
   */
  cancelAction: async (type, id, action) => {
    try {
      // For events, use the real API endpoint
      if (type === 'events' && action === 'join') {
        // Import dynamically to avoid circular dependencies
        const eventService = (await import('./eventService')).default;
        const userId = localStorage.getItem('userId') || '1';
        
        const result = await eventService.leaveEvent(id, userId);
        return {
          success: true,
          message: 'You have successfully left this event.',
          data: result,
          timestamp: new Date().toISOString()
        };
      }
      
      // For other types, use mock implementation for now
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock success response
      const actionVerb = 
        action === 'rsvp' ? 'RSVP' : 
        action === 'join' ? 'membership' : 
        'application';
      
      return {
        success: true,
        message: `You have successfully cancelled your ${actionVerb} for this ${type.slice(0, -1)}.`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error cancelling action ${action} on ${type} with id ${id}:`, error);
      throw error;
    }
  }
};

export default eventDetailService;
