// eventsService.js
// Service for fetching events data from backend API
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

export async function getEvents() {
  try {
    // Get the current user ID from auth store
    const userId = useAuthStore.getState().user?._id;
    
    if (!userId) {
      console.error('User ID not available for fetching events');
      return [];
    }
    
    // Call backend API
    console.log('Fetching events for user:', userId);
    const response = await axios.get(`/api/events/myevents/${userId}`);
    
    // Log the response for debugging
    console.log('Backend events response:', response.data);
    
    // Return the data from API
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getEventById(id) {
  try {
    const response = await axios.get(`/api/events/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
}
