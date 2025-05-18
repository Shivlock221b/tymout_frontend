import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'; // Change to your backend address if needed
const API_URL = `${process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'}/api/messages`;

// util for sessionStorage key
const cacheKey = (eventId) => `chat-${eventId}`;

// useChatSocket: Real-time messaging with REST history
export function useChatSocket(eventId) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const user = useAuthStore(state => state.user);
  const isTypingRef = useRef(false);

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

  // Load from session cache first for instant render
  useEffect(() => {
    if (!eventId) return;
    const cached = sessionStorage.getItem(cacheKey(eventId));
    if (cached) {
      try { setMessages(JSON.parse(cached)); } catch { /* ignore */ }
    }
  }, [eventId]);

  // Setup socket connection
  useEffect(() => {
    if (!eventId || !user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('joinEvent', eventId);
    
    // Listen for typing status updates
    socket.on('typingStatus', ({ users }) => {
      if (!Array.isArray(users)) return;
      setTypingUsers(users);
    });
    
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
          return [...prev.slice(0, pendingIndex), normalizedMsg, ...prev.slice(pendingIndex + 1)];
        }
        
        return [...prev, normalizedMsg];
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

    // statusUpdate (e.g., delivered/read)
    socket.on('statusUpdate', ({ messageId, status }) => {
      if (!messageId || !status) return;
      setMessages(prev => prev.map(m => (m._id === messageId || m.id === messageId) ? { ...m, status } : m));
    });

    return () => {
      socket.off('messageDeleted');
      socket.off('sentAck');
      socket.off('statusUpdate');
      socket.off('typingStatus');
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
  const deleteMessage = useCallback((messageId) => {
    if (!socketRef.current || !messageId) return;
    socketRef.current.emit('deleteMessage', { eventId, messageId });
  }, [eventId]);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    if (!eventId) return;
    try {
      sessionStorage.setItem(cacheKey(eventId), JSON.stringify(messages));
    } catch {}
  }, [messages, eventId]);

  // Create a ref to store the debounced function instance
  const debouncedFnRef = useRef(null);
  
  // Initialize the debounced function once
  useEffect(() => {
    // Create the debounced function
    const debouncedFn = debounce((socket, eventId, userId, userName, typingRef) => {
      if (!socket || !typingRef?.current) return;
      socket.emit('typing', {
        eventId,
        userId,
        userName,
        isTyping: false
      });
      if (typingRef) typingRef.current = false;
    }, 2000);
    
    // Store it in the ref
    debouncedFnRef.current = debouncedFn;
    
    // Clean up on unmount
    return () => {
      if (debouncedFnRef.current?.cancel) {
        debouncedFnRef.current.cancel();
      }
    };
  }, []);
  
  // Send typing status - debounced to avoid flooding
  const debouncedStopTyping = useCallback(() => {
    if (!socketRef.current || !user || !isTypingRef.current || !debouncedFnRef.current) return;
    debouncedFnRef.current(
      socketRef.current, 
      eventId, 
      user?._id, 
      user?.name, 
      isTypingRef
    );
  }, [eventId, user]);

  // Update typing status
  const updateTypingStatus = useCallback((isTyping) => {
    if (!socketRef.current || !user) return;
    
    // Only emit if status changed to avoid unnecessary events
    if (isTyping && !isTypingRef.current) {
      socketRef.current.emit('typing', {
        eventId,
        userId: user._id,
        userName: user.name,
        isTyping: true
      });
      isTypingRef.current = true;
    }
    
    if (isTyping) {
      // Reset the debounce timer each time user types
      debouncedStopTyping();
    } else if (isTypingRef.current) {
      // Immediately stop typing indicator if explicitly set to false
      if (debouncedFnRef.current?.cancel) {
        debouncedFnRef.current.cancel();
      }
      socketRef.current.emit('typing', {
        eventId,
        userId: user._id,
        userName: user.name,
        isTyping: false
      });
      isTypingRef.current = false;
    }
  }, [eventId, user, debouncedStopTyping]);

  // Add markAsRead function
  const markAsRead = useCallback(() => {
    if (!socketRef.current || !user || !eventId) return;
    socketRef.current.emit('markAsRead', { eventId, userId: user._id });
  }, [eventId, user]);

  return {
    messages,
    sendMessage,
    deleteMessage,
    setMessages,
    typingUsers,
    updateTypingStatus,
    markAsRead
  };
}
