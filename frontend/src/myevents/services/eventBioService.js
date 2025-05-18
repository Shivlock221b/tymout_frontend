// eventBioService.js
// Service for fetching event bio/description from backend API
import axios from 'axios';

export async function getEventBio(eventId) {
  try {
    if (!eventId) {
      console.error('Event ID not provided for fetching bio');
      return '';
    }
    
    console.log('Fetching bio for event:', eventId);
    const response = await axios.get(`/api/events/${eventId}`);
    
    // Log the response for debugging
    console.log('Event bio response:', response.data);
    
    // Return the bio or description from the event data
    const event = response.data.data;
    return event ? (event.bio || event.description || '') : '';
  } catch (error) {
    console.error(`Error fetching bio for event ${eventId}:`, error);
    return '';
  }
}
