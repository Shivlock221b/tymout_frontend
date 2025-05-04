import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { v4 as uuidv4 } from 'uuid';

const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'; // Change to your backend address if needed
const API_URL = `${process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'}/api/messages`;

// util for sessionStorage key
const cacheKey = (eventId) => `chat-${eventId}`;

// useChatSocket: Real-time messaging with REST history
export function useChatSocket(eventId) {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const user = useAuthStore(state => state.user);

  // Fetch chat history on mount/eventId change
  useEffect(() => {
    if (!eventId) return;
    
    // First, try to load from session cache for immediate display
    const cached = sessionStorage.getItem(cacheKey(eventId));
    if (cached) {
      try { 
        const cachedMessages = JSON.parse(cached);
        console.log(`[useChatSocket] Loaded ${cachedMessages.length} cached messages for event ${eventId}`);
        setMessages(cachedMessages); 
      } catch (e) { 
        console.error('[useChatSocket] Error parsing cached messages:', e);
      }
    }
    
    // Then fetch fresh data from API
    console.log(`[useChatSocket] Fetching messages for event ${eventId}`);
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
        
        console.log(`[useChatSocket] Fetched ${normalizedMsgs.length} messages from API for event ${eventId}`);
        setMessages(normalizedMsgs);
        
        // Update session cache with fresh data
        try {
          sessionStorage.setItem(cacheKey(eventId), JSON.stringify(normalizedMsgs));
        } catch (e) {
          console.error('[useChatSocket] Error caching messages:', e);
        }
      })
      .catch(error => {
        console.error('[useChatSocket] Error fetching messages:', error);
        if (!cached) setMessages([]);
      });
    
    // Clear messages when changing events
    return () => setMessages([]);
  }, [eventId]);

  // This effect is no longer needed as we're loading from cache in the main fetch effect
  // Keeping this comment for reference

  // Setup socket connection
  useEffect(() => {
    if (!eventId || !user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('joinEvent', eventId);
    socket.on('newMessage', (msg) => {
      if (!msg) return; // safeguard
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
          const newMessages = [...prev.slice(0, pendingIndex), normalizedMsg, ...prev.slice(pendingIndex + 1)];
          
          // Trigger a custom event to notify components that a new message was received
          setTimeout(() => {
            const event = new CustomEvent('newMessageReceived', { detail: { isNewMessage: true } });
            window.dispatchEvent(event);
            console.log('[useChatSocket] Dispatched newMessageReceived event (replaced pending)');
          }, 0);
          
          return newMessages;
        }
        
        // This is a completely new message
        const newMessages = [...prev, normalizedMsg];
        
        // Trigger a custom event to notify components that a new message was received
        setTimeout(() => {
          const event = new CustomEvent('newMessageReceived', { detail: { isNewMessage: true } });
          window.dispatchEvent(event);
          console.log('[useChatSocket] Dispatched newMessageReceived event (new message)');
        }, 0);
        
        return newMessages;
      });
      
      // send delivered ack if message from others
      if (msg && msg._id && msg.senderId !== user?._id) {
        socket.emit('deliveredAck', { eventId, messageId: msg._id });
      }
    });
    
    // Listen for messageDeleted event
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.map(m =>
        (m._id === messageId || m.id === messageId) ? { ...m, isDeleted: true, deleted: true, text: '' } : m
      ));
    });

    // Ack from server with final stored message
    socket.on('sentAck', (storedMsgRaw) => {
      // Normalize like in newMessage handler to ensure sender/_senderId exist
      const storedMsg = storedMsgRaw ? {
        ...storedMsgRaw,
        sender: storedMsgRaw.sender || storedMsgRaw.senderId || storedMsgRaw.userId || '',
        _senderId: String(storedMsgRaw.sender || storedMsgRaw.senderId || storedMsgRaw.userId || '').trim(),
        replyTo: storedMsgRaw.replyTo ? {
          ...storedMsgRaw.replyTo,
          sender: storedMsgRaw.replyTo.sender || storedMsgRaw.replyTo.senderId || '',
          _senderId: String(storedMsgRaw.replyTo.sender || storedMsgRaw.replyTo.senderId || '').trim()
        } : null
      } : null;
      if (!storedMsg || !storedMsg.clientMsgId) return; // guard
      setMessages(prev => {
        const idx = prev.findIndex(m => m.clientMsgId && m.clientMsgId === storedMsg.clientMsgId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...storedMsg, pending: false, status: 'sent' };
          return updated;
        }
        // if we didn't find pending, push it (in case user opened in second tab)
        return [...prev, storedMsg];
      });
    });

    // statusUpdate (e.g., delivered)
    socket.on('statusUpdate', ({ messageId, status }) => {
      if (!messageId || !status) return;
      setMessages(prev => prev.map(m => (m._id === messageId || m.id === messageId) ? { ...m, status } : m));
    });

    return () => {
      socket.off('messageDeleted');
      socket.off('sentAck');
      socket.off('statusUpdate');
      socket.disconnect();
    };
  }, [eventId, user]);

  // Send message with support for replies
  const sendMessage = useCallback((text, replyToMessage = null) => {
    if (!socketRef.current || !user || !text.trim()) return;
    
    const clientMsgId = uuidv4();
    
    // Prepare reply metadata if replying to a message
    const replyTo = replyToMessage ? {
      messageId: replyToMessage._id || replyToMessage.id,
      senderId: replyToMessage.senderId || replyToMessage.sender, 
      senderName: replyToMessage.senderName,
      text: replyToMessage.text
    } : null;
    
    // Create a temporary message object to show immediately in the UI
    const tempMessage = {
      _id: `temp-${clientMsgId}`,
      eventId,
      sender: user._id,
      senderId: user._id,
      _senderId: String(user._id).trim(),
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      clientMsgId,
      replyTo,
      timestamp: new Date().toISOString(),
      pending: true, // Mark as pending until confirmed by server
      status: 'pending'
    };
    
    // Add the message to the local state immediately
    setMessages(prev => [...prev, tempMessage]);
    
    // Trigger a custom event to notify components that a new message was sent
    setTimeout(() => {
      const event = new CustomEvent('newMessageReceived', { detail: { isNewMessage: true, isSent: true } });
      window.dispatchEvent(event);
      console.log('[useChatSocket] Dispatched newMessageReceived event (message sent)');
    }, 0);
    
    // Emit message with reply metadata
    socketRef.current.emit('sendMessage', {
      eventId,
      sender: user._id, // Ensure sender field is present
      senderId: user._id, // For backward compatibility
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      replyTo,
      clientMsgId,
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

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    if (!eventId) return;
    try {
      sessionStorage.setItem(cacheKey(eventId), JSON.stringify(messages));
    } catch {}
  }, [messages, eventId]);

  return {
    messages,
    sendMessage,
    deleteMessage,
    setMessages,
  };
}
