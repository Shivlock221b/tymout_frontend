// announcementsService.js
// Service for fetching event announcements from backend API
import axios from 'axios';

export async function getEventAnnouncements(eventId) {
  try {
    if (!eventId) {
      console.error('Event ID not provided for fetching announcements');
      return [];
    }
    
    console.log('Fetching announcements for event:', eventId);
    const response = await axios.get(`/api/events/${eventId}/announcements`);
    
    // Log the response for debugging
    console.log('Announcements response:', response.data);
    
    // Return the data from API
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching announcements for event ${eventId}:`, error);
    return [];
  }
}
