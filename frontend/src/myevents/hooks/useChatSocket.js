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
      
      // Check if this message already exists in our messages array to avoid duplicates
      setMessages(prev => {
        // Check if we already have this message (by ID if available, or by matching content and sender)
        const isDuplicate = prev.some(existingMsg => 
          (msg._id && existingMsg._id === msg._id) || 
          (msg.id && existingMsg.id === msg.id) ||
          (existingMsg._senderId === normalizedMsg._senderId && 
           existingMsg.text === msg.text && 
           Math.abs(new Date(existingMsg.timestamp || existingMsg.createdAt || Date.now()) - 
                   new Date(msg.timestamp || msg.createdAt || Date.now())) < 5000)
        );
        
        if (isDuplicate) {
          return prev; // Don't add duplicate messages
        }
        
        // If this is a message we sent and it's pending, replace the pending message
        const pendingIndex = prev.findIndex(m => m.pending && m._id.startsWith('temp-'));
        if (pendingIndex !== -1 && normalizedMsg.senderId === user._id) {
          return [...prev.slice(0, pendingIndex), normalizedMsg, ...prev.slice(pendingIndex + 1)];
        }
        
        return [...prev, normalizedMsg];
      });
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
    
    // Create a temporary message object to show immediately in the UI
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      eventId,
      sender: user._id,
      senderId: user._id,
      _senderId: String(user._id).trim(),
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      replyTo,
      timestamp: new Date().toISOString(),
      pending: true // Mark as pending until confirmed by server
    };
    
    // Add the message to the local state immediately
    setMessages(prev => [...prev, tempMessage]);
    
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
