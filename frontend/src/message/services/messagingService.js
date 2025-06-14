

import chatApi from './chatApi';
import { useAuthStore } from '../../stores/authStore';

// Keep mock data as fallback if API fails
// TODO: Move this placeholder to @data directory and import here as per project rules.
const mockThreadsData = [
  {
    id: 'thread1',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Hey, are you available for a call today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    unread: 2,
    online: true,
    tags: ['Private']
  },
  {
    id: 'thread2',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'The documents have been sent to your email',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    unread: 0,
    online: false,
    tags: ['Work']
  },
  {
    id: 'thread3',
    name: 'Tech Support',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastMessage: 'Your ticket #45678 has been resolved',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    unread: 1,
    online: true,
    tags: ['Support']
  },
  {
    id: 'thread4',
    name: 'Event Planning Team',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    lastMessage: 'We need to finalize the venue by tomorrow',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unread: 0,
    online: false,
    tags: ['Table']
  },
  {
    id: 'thread5',
    name: 'David Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    lastMessage: 'Looking forward to meeting you at the event!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    unread: 0,
    online: true,
    tags: ['Circle']
  }
];

// Mock data for message details
const mockDetailData = {
  thread1: {
    id: 'thread1',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    online: true,
    messages: [
      {
        id: 'msg1',
        threadId: 'thread1',
        senderId: 'john',
        senderName: 'John Smith',
        content: 'Hi there! How are you doing today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'read'
      },
      {
        id: 'msg2',
        threadId: 'thread1',
        senderId: 'current_user',
        senderName: 'You',
        content: 'I\'m doing well, thanks for asking! How about you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'read'
      },
      {
        id: 'msg3',
        threadId: 'thread1',
        senderId: 'john',
        senderName: 'John Smith',
        content: 'Great! I was wondering if you\'re available for a call today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'delivered'
      },
      {
        id: 'msg4',
        threadId: 'thread1',
        senderId: 'john',
        senderName: 'John Smith',
        content: 'I need to discuss some details about the project.',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        status: 'delivered'
      }
    ]
  },
  thread2: {
    id: 'thread2',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    online: false,
    messages: [
      {
        id: 'msg5',
        threadId: 'thread2',
        senderId: 'current_user',
        senderName: 'You',
        content: 'Hi Sarah, could you send me the documents we discussed yesterday?',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        status: 'read'
      },
      {
        id: 'msg6',
        threadId: 'thread2',
        senderId: 'sarah',
        senderName: 'Sarah Johnson',
        content: 'Sure, I\'ll get those to you right away.',
        timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
        status: 'read'
      },
      {
        id: 'msg7',
        threadId: 'thread2',
        senderId: 'sarah',
        senderName: 'Sarah Johnson',
        content: 'The documents have been sent to your email',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'read'
      }
    ]
  }
};

/**
 * MessageService
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all messaging related API calls and WebSocket interactions
 * - Each method handles a specific messaging operation
 */
const messagingService = {
  /**
   * Get all message threads for the current user
   * @returns {Promise<Array>} Message threads
   */
  getMessageThreads: async () => {
    try {
      // Get current user from auth store
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || !currentUser._id) {
        console.error('User not authenticated, using mock data');
        return mockThreadsData;
      }

      console.log('Fetching chats for user:', currentUser._id);
      
      // Fetch chats from API
      const chats = await chatApi.getUserChats(currentUser._id);
      console.log('Received chats from API:', chats);
      
      // If no chats or empty array, return mock data
      if (!chats || !Array.isArray(chats) || chats.length === 0) {
        console.log('No chats found, using mock data');
        return mockThreadsData;
      }
      
      // Transform chat data to match the expected format for message threads
      return chats.map(chat => {
        // Check if the response is in the expected format from chatController
        if (chat.otherUser) {
          // Format from chatController.getUserChats
          return {
            id: chat.chatId,
            name: chat.otherUser.name || 'User',
            avatar: chat.otherUser.avatar || 'https://via.placeholder.com/48?text=U',
            lastMessage: chat.lastMessage?.text || 'No messages yet',
            timestamp: chat.lastMessage?.timestamp || chat.lastActivity || new Date().toISOString(),
            unread: chat.unreadCount || 0,
            online: false, // We don't have real-time online status yet
            tags: ['Private']
          };
        } else {
          // Alternative format - find other participant manually
          const otherParticipant = chat.participants?.find(p => p.userId !== currentUser._id) || chat.participants?.[0] || {};
          const lastMsg = chat.lastMessage || {};
          
          return {
            id: chat.chatId || chat._id,
            name: otherParticipant.name || 'User',
            avatar: otherParticipant.avatar || 'https://via.placeholder.com/48?text=U',
            lastMessage: lastMsg.text || 'No messages yet',
            timestamp: lastMsg.timestamp || lastMsg.createdAt || new Date().toISOString(),
            unread: chat.unreadCount || 0,
            online: otherParticipant.online || false,
            tags: ['Private']
          };
        }
      });
    } catch (error) {
      console.error('Error fetching message threads:', error);
      // Return mock data as fallback
      console.log('Using mock data as fallback due to error');
      return mockThreadsData;
    }
  },
  
  /**
   * Get messages for a specific thread
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} Thread details with messages
   */
  getThreadMessages: async (threadId) => {
    try {
      // Get current user from auth store
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || !currentUser._id) {
        throw new Error('User not authenticated');
      }

      // Fetch chat details and messages
      const [chat, messagesData] = await Promise.all([
        chatApi.getChat(threadId),
        chatApi.getMessages(threadId)
      ]);
      
      // Find the other participant
      const otherParticipant = chat.participants.find(p => p.userId !== currentUser._id) || chat.participants[0] || {};
      
      // Mark messages as read
      chatApi.markAsRead(threadId, currentUser._id).catch(err => {
        console.error('Error marking messages as read:', err);
      });
      
      // Return formatted thread data
      return {
        id: chat.chatId || chat._id,
        name: otherParticipant.name || 'User',
        avatar: otherParticipant.avatar || 'https://via.placeholder.com/48?text=U',
        online: otherParticipant.online || false,
        messages: messagesData.map(msg => ({
          id: msg._id,
          threadId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          content: msg.text,
          timestamp: msg.timestamp || msg.createdAt,
          status: msg.status || 'sent'
        }))
      };
    } catch (error) {
      console.error(`Error fetching messages for thread ${threadId}:`, error);
      // Try to use mock data as fallback
      const mockThread = mockDetailData[threadId];
      if (mockThread) {
        console.log('Using mock data as fallback');
        return mockThread;
      }
      throw error;
    }
  },
  
  /**
   * Send a message to a thread
   * @param {string} threadId - Thread ID
   * @param {string} content - Message content
   * @returns {Promise<Object>} Sent message
   */
  sendMessage: async (threadId, content) => {
    try {
      // Get current user from auth store
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || !currentUser._id) {
        throw new Error('User not authenticated');
      }
      
      // Send message using chat API
      const payload = {
        chatId: threadId,
        senderId: currentUser._id,
        senderName: currentUser.name || currentUser.username || 'You',
        senderAvatar: currentUser.profileImage || '',
        text: content,
        clientMsgId: `msg_${Date.now()}`
      };
      
      const savedMessage = await chatApi.sendMessage(payload);
      
      // Return formatted message
      return {
        id: savedMessage._id,
        threadId,
        senderId: currentUser._id,
        senderName: 'You',
        content: savedMessage.text,
        timestamp: savedMessage.timestamp || savedMessage.createdAt,
        status: savedMessage.status || 'sent'
      };
    } catch (error) {
      console.error(`Error sending message to thread ${threadId}:`, error);
      throw error;
    }
  },
  
  /**
   * Mark a thread as read
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} Updated thread
   */
  markThreadAsRead: async (threadId) => {
    try {
      // Get current user from auth store
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || !currentUser._id) {
        throw new Error('User not authenticated');
      }
      
      // Mark messages as read using chat API
      const result = await chatApi.markAsRead(threadId, currentUser._id);
      return { threadId, success: true, ...result };
    } catch (error) {
      console.error(`Error marking thread ${threadId} as read:`, error);
      throw error;
    }
  },
  
  /**
   * Initialize WebSocket connection for real-time messaging
   * @param {Function} onMessageReceived - Callback for new messages
   * @param {Function} onTypingStatus - Callback for typing status updates
   * @param {Function} onThreadUpdated - Callback for thread updates
   * @returns {Object} WebSocket controller
   */
  initializeWebSocket: (onMessageReceived, onTypingStatus, onThreadUpdated) => {
    // In a production app, this would create a real WebSocket connection
    console.log('WebSocket connection initialized (mock)');
    
    // Setup mock WebSocket message simulation
    const mockWsController = {
      isConnected: true,
      
      // Simulate sending typing status
      sendTypingStatus: (threadId, isTyping) => {
        console.log(`Mock WS: Sending typing status: ${isTyping} for thread ${threadId}`);
      },
      
      // Disconnect the WebSocket
      disconnect: () => {
        console.log('Mock WS: Disconnected');
        mockWsController.isConnected = false;
      }
    };
    
    // Return the controller for later use
    return mockWsController;
  }
};

export default messagingService;
