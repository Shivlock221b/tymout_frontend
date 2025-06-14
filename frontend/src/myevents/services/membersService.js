// membersService.js
// Service for fetching event attendees from backend API
import axios from 'axios';

export async function getEventMembers(eventId) {
  try {
    if (!eventId) {
      console.error('Event ID not provided for fetching members');
      return [];
    }
    
    console.log('Fetching attendees for event:', eventId);
    const response = await axios.get(`/api/events/${eventId}/attendees`);
    
    // Log the response for debugging
    console.log('Event attendees response:', response.data);
    
    // Return the attendees from the event data
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching attendees for event ${eventId}:`, error);
    return [];
  }
}
