import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'}/api/messages`;

/**
 * Custom hook to fetch the last message for an event
 * 
 * @param {string} eventId - The ID of the event to fetch the last message for
 * @returns {Object} The last message object with text and sender information
 */
export function useLastMessage(eventId) {
  const [lastMessage, setLastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    
    setLoading(true);
    
    // Fetch the last message for this event
    axios.get(`${API_URL}/${eventId}/last`)
      .then(res => {
        if (res.data) {
          setLastMessage(res.data);
        } else {
          setLastMessage(null);
        }
      })
      .catch(err => {
        console.error('Error fetching last message:', err);
        setLastMessage(null);
      })
      .finally(() => {
        setLoading(false);
      });
      
  }, [eventId]);

  return { lastMessage, loading };
}

export default useLastMessage;
