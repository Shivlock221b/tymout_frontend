import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'; // Change to your backend address if needed
const API_URL = `${process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'}/api/messages`;

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
              // Ensure consistent sender ID format for comparison
              _senderId: String(msg.sender || msg.senderId || msg.userId || '').trim(),
              // Normalize replyTo if it exists
              replyTo: msg.replyTo ? {
                ...msg.replyTo,
                sender: msg.replyTo.sender || msg.replyTo.senderId || '',
                _senderId: String(msg.replyTo.sender || msg.replyTo.senderId || '').trim()
              } : null
            }))
          : [];
        setMessages(normalizedMsgs);
      })
      .catch(() => setMessages([]));
    
    // Clear messages when changing events
    return () => setMessages([]);
  }, [eventId]);

  // Setup socket connection
  useEffect(() => {
    if (!eventId || !user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('joinEvent', eventId);
    socket.on('newMessage', (msg) => {
      // Skip if this is a message we just sent (to avoid duplicates)
      if (user && msg.senderId === user._id && Date.now() - new Date(msg.timestamp).getTime() < 5000) {
        return;
      }
      
      // Normalize message to ensure sender field exists and properly handle replyTo
      const normalizedMsg = {
        ...msg,
        sender: msg.sender || msg.senderId || msg.userId || '',
        // Ensure consistent sender ID format for comparison
        _senderId: String(msg.sender || msg.senderId || msg.userId || '').trim(),
        // Normalize replyTo if it exists
        replyTo: msg.replyTo ? {
          ...msg.replyTo,
          sender: msg.replyTo.sender || msg.replyTo.senderId || '',
          _senderId: String(msg.replyTo.sender || msg.replyTo.senderId || '').trim()
        } : null
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

  // Send message with support for replies
  const sendMessage = useCallback((text, replyToMessage = null) => {
    if (!socketRef.current || !user || !text.trim()) return;
    
    // Prepare reply metadata if replying to a message
    const replyTo = replyToMessage ? {
      messageId: replyToMessage._id || replyToMessage.id,
      senderId: replyToMessage.senderId || replyToMessage.sender, 
      senderName: replyToMessage.senderName,
      text: replyToMessage.text
    } : null;
    
    // Emit message with reply metadata
    socketRef.current.emit('sendMessage', {
      eventId,
      sender: user._id, // Ensure sender field is present
      senderId: user._id, // For backward compatibility
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      replyTo
    });
    
    // Don't add the message locally anymore, as we'll receive it back from the socket
    // This ensures we have the server-generated ID and consistent data
  }, [eventId, user]);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    if (!eventId || !messageId) return;
    try {
      // Emit deleteMessage event to the socket
      if (socketRef.current) {
        socketRef.current.emit('deleteMessage', { eventId, messageId });
      } else {
        // Fallback to REST API if socket isn't available
        await axios.patch(`${API_URL}/${eventId}/${messageId}/delete`);
      }
      // UI will update via socket 'messageDeleted' event
    } catch (err) {
      // Optionally handle error
      console.error('Failed to delete message', err);
    }
  }, [eventId]);

  return {
    messages,
    sendMessage,
    deleteMessage,
    setMessages,
  };
}
