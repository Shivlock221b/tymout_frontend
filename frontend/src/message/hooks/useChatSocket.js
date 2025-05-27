import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash-es';
import chatApi from '../services/chatApi';
import { useAuthStore } from '../../stores/authStore';

// Socket base URL (falls back to localhost)
const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3030';

/**
 * useChatSocket – hook that wires REST history with Socket.IO real-time stream
 * Inspired by the group chat hook but simplified for one-on-one chats.
 *
 * @param {string} chatId – composite id of the conversation (userA_userB)
 */
export function useChatSocket(chatId) {
  const { user } = useAuthStore();
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  /* --------------------------------------------------------------------- */
  /*                            INITIAL HISTORY                            */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    if (!chatId) return;

    (async () => {
      try {
        const history = await chatApi.getMessages(chatId, { skip: 0, limit: 100 });
        const sorted = (history?.messages || []).sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sorted);
      } catch (err) {
        console.error('Failed to load chat history', err);
        setMessages([]);
      }
    })();

    return () => setMessages([]);
  }, [chatId]);

  /* --------------------------------------------------------------------- */
  /*                          SOCKET CONNECTION                            */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    if (!chatId || !user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current = socket;

    // Authenticate & join
    socket.emit('authenticate', user._id);
    socket.emit('joinChat', chatId);

    /* -------------------------- Incoming events ------------------------- */
    // New message from server / other user
    socket.on('newMessage', ({ chatId: incomingChatId, message }) => {
      if (incomingChatId !== chatId || !message) return;
      setMessages((prev) => {
        // avoid duplicates via _id or clientMsgId
        if (prev.some((m) => m._id === message._id || (m.clientMsgId && m.clientMsgId === message.clientMsgId))) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Acknowledgment for message we sent
    socket.on('messageAck', (ackMsg) => {
      if (!ackMsg?.clientMsgId) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.clientMsgId === ackMsg.clientMsgId);
        if (idx === -1) return prev;
        const clone = [...prev];
        clone[idx] = { ...ackMsg, status: 'sent' };
        return clone;
      });
    });

    // Messages read by other user
    socket.on('messagesRead', ({ chatId: incomingChatId, timestamp }) => {
      if (incomingChatId !== chatId) return;
      setMessages((prev) => prev.map((m) => ({ ...m, status: m.status === 'sent' ? 'read' : m.status, readAt: timestamp })));
    });

    // Typing indicators
    socket.on('userTyping', ({ chatId: incomingChatId, users }) => {
      if (incomingChatId !== chatId) return;
      setTypingUsers(users);
    });

    return () => {
      socket.emit('leaveChat', chatId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId, user]);

  /* --------------------------------------------------------------------- */
  /*                             SEND MESSAGE                              */
  /* --------------------------------------------------------------------- */
  const sendMessage = useCallback(
    (text, replyTo = null) => {
      if (!socketRef.current || !user || !text?.trim()) return;

      const clientMsgId = uuidv4();

      // optimistic
      const tempMsg = {
        _id: `tmp_${clientMsgId}`,
        clientMsgId,
        chatId,
        senderId: user._id,
        senderName: user.name,
        senderAvatar: user.avatar,
        text,
        timestamp: new Date().toISOString(),
        status: 'sending',
        replyTo
      };
      setMessages((prev) => [...prev, tempMsg]);

      socketRef.current.emit('sendMessage', {
        chatId,
        senderId: user._id,
        senderName: user.name,
        senderAvatar: user.avatar,
        text,
        replyTo,
        clientMsgId
      });
    },
    [chatId, user]
  );

  /* --------------------------------------------------------------------- */
  /*                          MARK AS READ / SEEN                          */
  /* --------------------------------------------------------------------- */
  const markMessagesAsRead = useCallback(async () => {
    if (!chatId || !user) return;
    try {
      await chatApi.markAsRead(chatId, user._id);
      socketRef.current?.emit('markAsRead', { chatId, userId: user._id });
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  }, [chatId, user]);

  /* --------------------------------------------------------------------- */
  /*                              TYPING STATUS                             */
  /* --------------------------------------------------------------------- */
  const typingDebounced = useRef(
    debounce((isTyping) => {
      if (!socketRef.current || !chatId || !user) return;
      socketRef.current.emit('typing', {
        chatId,
        userId: user._id,
        userName: user.name,
        isTyping
      });
    }, 300)
  ).current;

  const setTyping = useCallback(
    (isTyping) => {
      typingDebounced(isTyping);
    },
    [typingDebounced]
  );

  return {
    messages,
    setMessages,
    typingUsers,
    sendMessage,
    markMessagesAsRead,
    setTyping
  };
}
