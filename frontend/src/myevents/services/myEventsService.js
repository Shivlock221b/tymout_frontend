import axios from 'axios';

// Configure axios to connect directly to the event service
// Note: This bypasses the API gateway
const eventServiceClient = axios.create({
  baseURL: process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002', // Event service runs on port 3002
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add auth token
eventServiceClient.interceptors.request.use(
  config => {
    // Extract token from 'auth-storage' in localStorage
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      } catch (e) {
        // Optionally log error
      }
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const myEventsService = {
  /**
   * Get all events for the current user (both hosting and attending)
   * @param {string} userId - The user's ID
   * @returns {Promise} - Promise resolving to an array of events
   */
  getMyEvents: async (userId) => {
    try {
      const response = await eventServiceClient.get(`/events/myevents/${userId}`);
      console.log('My events response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error;
    }
  },

  /**
   * Get events the user is attending but not hosting
   * @param {string} userId - The user's ID
   * @returns {Promise} - Promise resolving to an array of events
   */
  getEventsAttending: async (userId) => {
    try {
      const response = await eventServiceClient.get(`/events/attending/${userId}`);
      console.log('Events attending response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching events attending:', error);
      throw error;
    }
  },

  /**
   * Get events the user is hosting
   * @param {string} userId - The user's ID
   * @returns {Promise} - Promise resolving to an array of events
   */
  getHostedEvents: async (userId) => {
    try {
      const response = await eventServiceClient.get(`/events/host/${userId}`);
      console.log('Hosted events response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching hosted events:', error);
      throw error;
    }
  },
  
  /**
   * Get pending join requests for a specific event
   * @param {string} eventId - The event's ID
   * @returns {Promise} - Promise resolving to an array of pending requests
   */
  getEventPendingRequests: async (eventId) => {
    try {
      const response = await eventServiceClient.get(`/events/${eventId}/requests/pending`);
      console.log('Event pending requests response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event pending requests:', error);
      throw error;
    }
  },
  
  /**
   * Get all pending join requests for events hosted by the current user
   * @param {string} hostId - The host's ID (optional, defaults to current user)
   * @returns {Promise} - Promise resolving to an array of events with pending requests
   */
  getPendingJoinRequests: async (hostId) => {
    try {
      const userId = hostId || localStorage.getItem('userId');
      const response = await eventServiceClient.get(`/events/requests/pending/${userId}`);
      console.log('All pending join requests response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all pending join requests:', error);
      throw error;
    }
  },
  
  /**
   * Approve a join request
   * @param {string} eventId - The event's ID
   * @param {string} requestId - The request's ID
   * @returns {Promise} - Promise resolving to the updated event
   */
  approveJoinRequest: async (eventId, requestId) => {
    try {
      const response = await eventServiceClient.post(`/events/${eventId}/requests/${requestId}/approve`);
      console.log('Approve join request response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error approving join request:', error);
      throw error;
    }
  },
  
  /**
   * Reject a join request
   * @param {string} eventId - The event's ID
   * @param {string} requestId - The request's ID
   * @returns {Promise} - Promise resolving to the updated event
   */
  rejectJoinRequest: async (eventId, requestId) => {
    try {
      const response = await eventServiceClient.post(`/events/${eventId}/requests/${requestId}/reject`);
      console.log('Reject join request response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      throw error;
    }
  },
  
  /**
   * Remove an attendee from an event
   * @param {string} eventId - The event's ID
   * @param {string} userId - The user's ID to remove
   * @returns {Promise} - Promise resolving to the updated event
   */
  removeAttendee: async (eventId, userId) => {
    try {
      const response = await eventServiceClient.delete(`/events/${eventId}/attendees`, {
        data: { userId }
      });
      console.log('Remove attendee response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error removing attendee:', error);
      throw error;
    }
  },
};

export default myEventsService;
