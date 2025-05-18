/**
 * Event Service
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all event-related API calls
 * - Each function handles a specific operation related to events
 */
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const eventService = {
  /**
   * Get event details by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  getEventById: async (eventId) => {
    try {
      console.log('[eventService] Fetching event by ID:', eventId);
      
      // Get current user ID from token if available or use localStorage as fallback
      const token = localStorage.getItem('token');
      let currentUserId = localStorage.getItem('userId'); // Fallback to localStorage userId
      
      if (token && !currentUserId) {
        try {
          // Parse JWT token to get user ID
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          currentUserId = payload.id;
        } catch (e) {
          console.error('[eventService] Error parsing token:', e);
        }
      }
      
      console.log('[eventService] Current user ID:', currentUserId);
      
      // Directly call event-service backend (bypassing API gateway)
      const response = await axios.get(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/${eventId}`);
      console.log('[eventService] Backend response:', response.data);
      
      // The backend returns { success: true, data: event }
      // Transform the response to match frontend expectations
      const event = response.data.data;
      
      if (!event) {
        throw new Error(`Event not found: ${eventId}`);
      }
      
      // Format date from MongoDB date object to string
      const startDate = event.date?.start ? new Date(event.date.start) : new Date();
      const formattedDate = startDate.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      });
      
      // Format location from object to string
      const locationStr = event.location?.city || 'Unknown Location';
      
      // Check if the current user has joined or requested to join this event
      let isJoined = false;
      let isRequested = false;
      
      // Store userId in localStorage for consistency
      if (currentUserId) {
        localStorage.setItem('userId', currentUserId);
        
        console.log('[eventService] Raw event data:', {
          attendees: event.attendees,
          requests: event.requests
        });
        
        // Check if user is in the attendees list
        isJoined = event.attendees?.some(attendee => {
          const attendeeId = attendee.userId?._id?.toString() || attendee.userId?.toString();
          const match = attendeeId === currentUserId;
          console.log('[eventService] Comparing attendee:', { attendeeId, currentUserId, match });
          return match;
        });
        
        // Check if user has a pending request
        isRequested = event.requests?.some(request => {
          const requesterId = request.userId?._id?.toString() || request.userId?.toString();
          const statusMatch = request.status === 'pending';
          const idMatch = requesterId === currentUserId;
          console.log('[eventService] Comparing request:', { 
            requesterId, 
            currentUserId, 
            status: request.status,
            idMatch,
            statusMatch,
            fullMatch: idMatch && statusMatch
          });
          return idMatch && statusMatch;
        });
        
        console.log('[eventService] FINAL User participation status:', { 
          currentUserId,
          isJoined, 
          isRequested 
        });
      }
      
      // Return the transformed event
      return {
        ...event,
        id: event._id, // Add id field based on MongoDB's _id
        type: event.type || 'event',
        image: event.image || null,
        location: locationStr,
        date: formattedDate,
        participants: event.attendees?.length || 0,
        maxParticipants: event.capacity || event.maxAttendees || 10,
        tags: event.tags || [],
        isJoined,
        isRequested,
        host: {
          id: event.host?.userId || 'unknown',
          name: event.host?.name || 'Anonymous Host',
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(event.host?.name || 'User')}&background=random&color=fff&size=128`
        }
      };
    } catch (error) {
      console.error('[eventService] Error fetching event details:', error);
      throw error;
    }
  },
  
  /**
   * Join an event
   * @param {string} eventId - Event ID
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Updated event
   */
  joinEvent: async (eventId, userData) => {
    try {
      // Get current user from auth store if available
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      
      // Ensure we have a consistent user ID
      const userId = currentUser?._id || localStorage.getItem('userId') || userData.userId || '1';
      // Store it for future use
      localStorage.setItem('userId', userId);
      
      // Get user's name from auth store if available
      const userName = currentUser?.name || currentUser?.fullName || userData.name || 'Anonymous User';
      
      // Update userData with consistent ID and name
      const updatedUserData = {
        ...userData,
        userId: userId,
        name: userName
      };
      
      console.log('[eventService] Requesting to join event:', { eventId, userData: updatedUserData });
      console.log('[eventService] Making POST request to:', `http://localhost:3002/events/${eventId}/join`);
      
      // Add authorization header if available
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[eventService] Added authorization header');
      } else {
        console.log('[eventService] No token found, request will be unauthorized');
      }
      
      // Make the API request
      const response = await axios.post(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/${eventId}/join`, updatedUserData, { headers });
      console.log('[eventService] Join event response:', response.data);
      
      // Handle the case where we get a 400 error because we've already requested
      // In this case, we still want to show the "Requested" state in the UI
      const updatedEvent = response.data.data;
      
      // Force the isRequested flag to be true regardless of the response
      // This ensures the UI shows the correct state even if there's an error
      return {
        ...updatedEvent,
        isRequested: true // Explicitly mark as requested
      };
    } catch (error) {
      // Check if the error is because we've already requested to join
      if (error.response && 
          error.response.status === 400 && 
          error.response.data.error.includes('already requested')) {
        console.log('[eventService] User has already requested to join this event');
        // Return an object with isRequested set to true to maintain UI state
        return {
          id: eventId,
          isRequested: true
        };
      }
      
      console.error(`[eventService] Error joining event:`, error.response ? error.response.data : error.message);
      throw error;
    }
  },
  
  /**
   * Leave an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated event
   */
  leaveEvent: async (eventId, userId) => {
    try {
      console.log('[eventService] Leaving event:', { eventId, userId });
      console.log('[eventService] Making POST request to:', `http://localhost:3002/events/${eventId}/leave`);
      
      // Add authorization header if available
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[eventService] Added authorization header');
      } else {
        console.log('[eventService] No token found, request will be unauthorized');
      }
      
      const response = await axios.post(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/${eventId}/leave`, { userId }, { headers });
      console.log('[eventService] Leave event response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`[eventService] Error leaving event:`, error.response ? error.response.data : error.message);
      throw error;
    }
  },
  
  /**
   * Submit feedback for an event
   * @param {string} eventId - Event ID
   * @param {Object} feedbackData - Feedback data (hostRating, eventRating, comment)
   * @returns {Promise<Object>} Updated event
   */
  submitFeedback: async (eventId, feedbackData) => {
    try {
      console.log('[eventService] Submitting feedback for event:', { eventId, feedbackData });
      console.log('[eventService] Making POST request to:', `http://localhost:3002/events/${eventId}/feedback`);
      
      // Add authorization header if available
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[eventService] Added authorization header');
      } else {
        console.log('[eventService] No token found, request will be unauthorized');
      }
      
      const response = await axios.post(`${process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002'}/events/${eventId}/feedback`, feedbackData, { headers });
      console.log('[eventService] Submit feedback response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`[eventService] Error submitting feedback:`, error.response ? error.response.data : error.message);
      throw error;
    }
  }
};

export default eventService;
