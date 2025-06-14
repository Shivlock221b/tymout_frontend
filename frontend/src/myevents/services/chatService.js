// chatService.js
// Service for fetching chat data (mock backend)
import axios from 'axios';

export async function getEventChat(eventId) {
  const res = await axios.get(`/api/messages/${eventId}`);
  // The backend now returns an array of messages
  return res.data;
}
