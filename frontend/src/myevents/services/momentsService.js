// momentsService.js
// Service for fetching event moments/photos from backend API
import axios from 'axios';

export async function getEventMoments(eventId) {
  try {
    if (!eventId) {
      console.error('Event ID not provided for fetching moments/photos');
      return [];
    }
    
    console.log('Fetching moments/photos for event:', eventId);
    const response = await axios.get(`/api/events/${eventId}/photos`);
    
    // Log the response for debugging
    console.log('Event photos response:', response.data);
    
    // Return the photos from the event data
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching photos for event ${eventId}:`, error);
    return [];
  }
}
