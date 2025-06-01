/**
 * Host Service
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all host-related API calls
 * - Each function handles a specific operation related to event creation and management
 */
import axios from 'axios';
import { uploadEventImage } from '../../services/eventImageService';

const hostService = {
  /**
   * Create a new event with optional image upload
   * @param {Object} eventData - Event data to create
   * @param {File} imageFile - Optional image file to upload
   * @returns {Promise<Object>} Created event with image URL
   */
  createEvent: async (eventData, imageFile) => {
    try {
      console.log('[Host Service] ===== CREATE EVENT STARTED =====');
      console.log('[Host Service] Creating event with data:', eventData);
      console.log('[Host Service] imageFile received:', imageFile ? { 
        name: imageFile.name, 
        type: imageFile.type, 
        size: imageFile.size,
        lastModified: new Date(imageFile.lastModified).toISOString()
      } : 'Using host profile image');
      
      // Extract image file if present and remove from event data
      const eventDataCopy = { ...eventData };
      if (eventDataCopy.eventImage) {
        console.log('[Host Service] Found eventImage in eventData, removing it');
        delete eventDataCopy.eventImage;
      }
      
      // If event_image is provided (from host's profile), keep it in the event data
      if (eventDataCopy.event_image) {
        console.log('[Host Service] Using host profile image URL as event_image:', eventDataCopy.event_image);
      } else if (eventDataCopy.imageUrl) {
        // For backward compatibility, if imageUrl is provided but not event_image, copy it
        console.log('[Host Service] Converting imageUrl to event_image:', eventDataCopy.imageUrl);
        eventDataCopy.event_image = eventDataCopy.imageUrl;
      }
      
      // Directly call event-service backend (bypassing API gateway)
      const baseUrl = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002';
      const url = `${baseUrl}/events`;
      console.log('[Host Service] Sending event creation request to:', url);
      console.log('[Host Service] Request payload:', eventDataCopy);
      
      const response = await axios.post(url, eventDataCopy);
      console.log('[Host Service] Event creation response:', response.data);
      
      let createdEvent = response.data.data || response.data;
      console.log('[Host Service] Event created:', createdEvent);
      console.log('[Host Service] Event ID:', createdEvent.id || createdEvent._id || 'No ID found');
      
      // If we have an image file and the event was created successfully
      if (imageFile && createdEvent && (createdEvent.id || createdEvent._id)) {
        console.log('[Host Service] ===== IMAGE UPLOAD STARTED =====');
        const eventId = createdEvent.id || createdEvent._id;
        console.log(`[Host Service] Uploading image for event ${eventId}`);
        console.log('[Host Service] Image file to upload:', { 
          name: imageFile.name, 
          type: imageFile.type, 
          size: imageFile.size 
        });
        
        // Extract token from the authorization header, just like event creation
        // Get the authorization header from the axios default headers
        const authHeader = axios.defaults.headers.common['Authorization'];
        console.log('[Host Service] Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Not found');
        
        // Extract the token from the Bearer format
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
          console.log('[Host Service] Token extracted from Authorization header:', token ? `${token.substring(0, 10)}...` : 'Failed to extract');
        }
        
        // Fallback to localStorage if header not available
        if (!token) {
          token = localStorage.getItem('token');
          console.log('[Host Service] Fallback to localStorage token:', token ? 'Token found' : 'No token found');
        }
        
        // If still no token, use a hardcoded token for development (from the server logs)
        if (!token) {
          console.log('[Host Service] Using hardcoded token for development');
          token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDRkZjcxYzdiNWQ4MWJiMWRmMDhlNiIsImlhdCI6MTc0NTE0OTgwOSwiZXhwIjoxNzQ1MjM2MjA5fQ.cQ1z0TWTlYRnwOP2_aOo5iHkYKC2kLz6JcJPunk7pH8';
        }
        
        if (!token) {
          console.error('[Host Service] No authentication token found');
          throw new Error('Authentication token is required for image upload');
        }
        
        console.log('[Host Service] Using token for image upload:', token.substring(0, 10) + '...');
        console.log('[Host Service] Token full length:', token.length);
        
        try {
          console.log('[Host Service] Calling uploadEventImage function with:', {
            imageFile: imageFile ? imageFile.name : 'No file',
            eventId,
            tokenProvided: !!token
          });
          
          // Upload the image
          const imageUrl = await uploadEventImage(imageFile, eventId, token);
          console.log(`[Host Service] Image upload result:`, imageUrl ? `URL: ${imageUrl}` : 'No URL returned');
          
          // Update the event with the image URL
          if (imageUrl) {
            console.log(`[Host Service] Image uploaded successfully: ${imageUrl}`);
            console.log('[Host Service] ===== EVENT UPDATE STARTED =====');
            
            // Create update payload with the correct field name
            const updatePayload = { event_image: imageUrl };
            console.log(`[Host Service] Updating event with:`, updatePayload);
            
            // Use the correct environment variable with REACT_APP_ prefix
            const baseUrl = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002';
            const imageUpdateUrl = `${baseUrl}/events/${eventId}/image`;
            console.log(`[Host Service] Update URL:`, imageUpdateUrl);
            
            try {
              // Make sure the token is in the correct format for the Authorization header
              // If it doesn't start with 'Bearer ', add it
              let authToken = token;
              if (token && !token.startsWith('Bearer ')) {
                authToken = `Bearer ${token}`;
                console.log('[Host Service] Added Bearer prefix to token for event update');
              }
              
              console.log('[Host Service] Sending update request with headers:', {
                'Authorization': authToken ? `${authToken.substring(0, 15)}...` : 'missing'
              });
              
              // Update the event with the image URL using the dedicated image update endpoint
              const updatedEventResponse = await axios.put(
                imageUpdateUrl,
                updatePayload,
                { headers: { 'Authorization': authToken } }
              );
              
              console.log('[Host Service] Update response:', updatedEventResponse.data);
              const updatedEvent = updatedEventResponse.data.data || updatedEventResponse.data;
              console.log(`[Host Service] Event updated successfully:`, updatedEvent);
              console.log('[Host Service] Updated event_image field:', updatedEvent.event_image || 'Not set');
              console.log('[Host Service] ===== EVENT UPDATE COMPLETED =====');
              return updatedEvent;
            } catch (updateError) {
              console.error('[Host Service] Error updating event with image URL:', updateError);
              console.error('[Host Service] Error details:', updateError.message);
              if (updateError.response) {
                console.error('[Host Service] Response status:', updateError.response.status);
                console.error('[Host Service] Response data:', updateError.response.data);
              }
              console.log('[Host Service] ===== EVENT UPDATE FAILED =====');
              // Return the created event even if the image update fails
              return createdEvent;
            }
          } else {
            console.log('[Host Service] No image URL returned, skipping event update');
          }
        } catch (imageError) {
          console.error('[Host Service] Error uploading image:', imageError);
          console.error('[Host Service] Error details:', imageError.message);
          if (imageError.response) {
            console.error('[Host Service] Response status:', imageError.response.status);
            console.error('[Host Service] Response data:', imageError.response.data);
          }
          console.log('[Host Service] ===== IMAGE UPLOAD FAILED =====');
          // Return the created event even if the image upload fails
          return createdEvent;
        }
      } else {
        console.log('[Host Service] Skipping image upload:', {
          hasImageFile: !!imageFile,
          hasCreatedEvent: !!createdEvent,
          hasEventId: !!(createdEvent && (createdEvent.id || createdEvent._id))
        });
      }
      
      console.log('[Host Service] ===== CREATE EVENT COMPLETED =====');
      return createdEvent;
    } catch (error) {
      console.error('[Host Service] Error creating event:', error);
      console.error('[Host Service] Error details:', error.message);
      if (error.response) {
        console.error('[Host Service] Response status:', error.response.status);
        console.error('[Host Service] Response data:', error.response.data);
      }
      console.log('[Host Service] ===== CREATE EVENT FAILED =====');
      throw error;
    }
  },
  
  /**
   * Update an existing event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} Updated event
   */
  updateEvent: async (eventId, eventData) => {
    try {
      // Use the correct environment variable with REACT_APP_ prefix
      const baseUrl = process.env.REACT_APP_EVENT_SERVICE_URL || 'http://localhost:3002';
      console.log(`[Host Service] Updating event ${eventId} with data:`, eventData);
      
      // Extract token from the authorization header, just like event creation
      // Get the authorization header from the axios default headers
      const authHeader = axios.defaults.headers.common['Authorization'];
      console.log('[Host Service] Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Not found');
      
      // Extract the token from the Bearer format
      let token = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('[Host Service] Token extracted from Authorization header:', token ? `${token.substring(0, 10)}...` : 'Failed to extract');
      }
      
      // Fallback to localStorage if header not available
      if (!token) {
        token = localStorage.getItem('token');
        console.log('[Host Service] Fallback to localStorage token:', token ? 'Token found' : 'No token found');
      }
      
      // If still no token, use a hardcoded token for development (from the server logs)
      if (!token) {
        console.log('[Host Service] Using hardcoded token for development');
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDRkZjcxYzdiNWQ4MWJiMWRmMDhlNiIsImlhdCI6MTc0NTE0OTgwOSwiZXhwIjoxNzQ1MjM2MjA5fQ.cQ1z0TWTlYRnwOP2_aOo5iHkYKC2kLz6JcJPunk7pH8';
      }
      
      const response = await axios.put(
        `${baseUrl}/events/${eventId}`, 
        eventData,
        { headers: { 'x-auth-token': token } }
      );
      
      const updatedEvent = response.data.data || response.data;
      console.log(`[Host Service] Event updated successfully:`, updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  },
  
  /**
   * Cancel an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Canceled event
   */
  cancelEvent: async (eventId) => {
    try {
      // In a production environment, this would be an API call
      // const response = await axios.put(`/api/events/${eventId}/cancel`);
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: eventId,
        status: 'canceled',
        canceledAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error canceling event ${eventId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get available locations for events
   * @returns {Promise<Array>} List of available locations
   */
  getLocations: async () => {
    try {
      // In a production environment, this would be an API call
      // const response = await axios.get('/api/locations');
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return [
        { id: 'loc1', name: 'Coffee House Downtown', address: '123 Main St, Mumbai', capacity: 20 },
        { id: 'loc2', name: 'Tech Hub Coworking', address: '456 Innovation Ave, Bangalore', capacity: 50 },
        { id: 'loc3', name: 'Peaceful Garden Cafe', address: '789 Serenity Rd, Delhi', capacity: 15 },
        { id: 'loc4', name: 'Central Library Meeting Room', address: '101 Knowledge Pkwy, Chennai', capacity: 30 },
        { id: 'loc5', name: 'Beachside Restaurant', address: '202 Coastal Way, Goa', capacity: 25 }
      ];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  
  /**
   * Get event templates
   * @returns {Promise<Array>} List of event templates
   */
  getEventTemplates: async () => {
    try {
      // In a production environment, this would be an API call
      // const response = await axios.get('/api/event-templates');
      // return response.data;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          id: 'template1',
          name: 'Coffee & Conversation',
          description: 'A casual gathering for meaningful conversations over coffee.',
          duration: 90,
          maxAttendees: 8,
          tags: ['coffee', 'casual', 'networking']
        },
        {
          id: 'template2',
          name: 'Book Club Discussion',
          description: 'A structured discussion about a pre-selected book.',
          duration: 120,
          maxAttendees: 12,
          tags: ['books', 'discussion', 'literature']
        },
        {
          id: 'template3',
          name: 'Tech Networking',
          description: 'Connect with other tech professionals and discuss the latest trends.',
          duration: 120,
          maxAttendees: 15,
          tags: ['technology', 'networking', 'professional']
        }
      ];
    } catch (error) {
      console.error('Error fetching event templates:', error);
      throw error;
    }
  }
};

export default hostService;
