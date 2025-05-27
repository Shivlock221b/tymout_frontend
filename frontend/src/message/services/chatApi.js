import axios from 'axios';

// Centralized axios instance for the one-on-one chat service
// Use API gateway for all requests to maintain consistent routing
const API_BASE = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000';

// All chat endpoints will be under /api/chats path
const CHAT_ENDPOINT = `${API_BASE}/api/chats`;

console.log('Chat API configured with endpoint:', CHAT_ENDPOINT);

const client = axios.create({
  baseURL: CHAT_ENDPOINT,
  withCredentials: true
});

/*
-------------------------------------------------------------------
chatApi – REST wrappers for one-on-one chat micro-service
-------------------------------------------------------------------
Each method returns the .data field directly for convenience.
*/

const chatApi = {
  // Fetch all chats for a user (chat previews)
  getUserChats: async (userId) => {
    const { data } = await client.get(`/user/${userId}`);
    return data;
  },

  // Fetch a single chat (metadata + participants)
  getChat: async (chatId) => {
    const { data } = await client.get(`/${chatId}`);
    return data;
  },

  // Fetch messages for a chat (supports pagination)
  getMessages: async (chatId, { limit = 50, skip = 0 } = {}) => {
    const { data } = await client.get(`/${chatId}/messages`, {
      params: { limit, skip }
    });
    return data;
  },

  // Send a new message
  sendMessage: async (payload) => {
    // payload expects: { chatId, senderId, senderName, senderAvatar, text, replyTo?, clientMsgId? }
    const { data } = await client.post('/message', payload);
    return data;
  },

  // Mark all messages as read for a user in a chat
  markAsRead: async (chatId, userId) => {
    const { data } = await client.post(`/${chatId}/read`, { userId });
    return data;
  },

  // Get chat preview with unread count
  getChatPreview: async (chatId, userId) => {
    const { data } = await client.get(`/${chatId}/preview`, { params: { userId } });
    return data;
  },

  // Update chat block status
  updateChatStatus: async (chatId, { isBlocked, blockedBy }) => {
    const { data } = await client.patch(`/${chatId}/status`, { isBlocked, blockedBy });
    return data;
  },

  // Create or fetch a direct chat between two users
  startDirectChat: async (userAId, userBId, userAName, userBName, userAAvatar, userBAvatar) => {
    const { data } = await client.post('/direct', { 
      userAId, 
      userBId,
      userAName,
      userBName,
      userAAvatar,
      userBAvatar
    });
    return data;
  }
};

export default chatApi;
