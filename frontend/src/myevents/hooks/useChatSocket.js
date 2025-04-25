import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const SOCKET_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3020'; // Change to your backend address if needed
const API_URL = `${process.env.CHAT_SERVICE_URL}/api/messages` || 'http://localhost:3020/api/messages';

// useChatSocket: Real-time messaging with REST history
export function useChatSocket(eventId) {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const user = useAuthStore(state => state.user);

  // Fetch chat history on mount/eventId change
  useEffect(() => {
    if (!eventId) return;
    axios.get(`${API_URL}/${eventId}`)
      .then(res => {
        // Normalize all messages to ensure sender field exists
        const normalizedMsgs = Array.isArray(res.data)
          ? res.data.map(msg => ({
              ...msg,
              sender: msg.sender || msg.senderId || msg.userId || '',
            }))
          : [];
        setMessages(normalizedMsgs);
      })
      .catch(() => setMessages([]));
  }, [eventId]);

  // Setup socket connection
  useEffect(() => {
    if (!eventId || !user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('joinEvent', eventId);
    socket.on('newMessage', (msg) => {
      // Normalize message to ensure sender field exists
      const normalizedMsg = {
        ...msg,
        sender: msg.sender || msg.senderId || msg.userId || '',
      };
      setMessages(prev => [...prev, normalizedMsg]);
    });
    // Listen for messageDeleted event
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.map(m =>
        (m._id === messageId || m.id === messageId) ? { ...m, deleted: true, text: '' } : m
      ));
    });
    return () => {
      socket.off('messageDeleted');
      socket.disconnect();
    };
  }, [eventId, user]);

  // Send message
  const sendMessage = useCallback((text) => {
    if (!socketRef.current || !user || !text.trim()) return;
    socketRef.current.emit('sendMessage', {
      eventId,
      sender: user._id, // Ensure sender field is present
      senderId: user._id, // For backward compatibility
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
    });
    // After sending, fetch the latest messages from the backend
    axios.get(`${API_URL}/${eventId}`)
      .then(res => setMessages(res.data))
      .catch(() => {});
  }, [eventId, user]);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    if (!eventId || !messageId) return;
    try {
      await axios.patch(`${API_URL}/${eventId}/${messageId}/delete`);
      // UI will update via socket event
    } catch (err) {
      // Optionally handle error
      console.error('Failed to delete message', err);
    }
  }, [eventId]);

  return {
    messages,
    sendMessage,
    setMessages,
  };
}
