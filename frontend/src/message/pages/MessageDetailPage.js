import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import chatApi from '../services/chatApi';
import { useAuthStore } from '../../stores/authStore';

// Import components for message UI
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import MessageTypingIndicator from '../components/MessageTypingIndicator';
import UserChatHeader from '../components/UserChatHeader';

// Import WebSocket service
import { useMessageWebSocket } from '../services/messageWebSocketService';

/**
 * MessageDetailPage Component
 * 
 * Displays the detailed conversation with a specific user
 * Following Single Responsibility Principle:
 * - This component handles the state management and data fetching for a conversation
 * - Delegates rendering to specialized child components
 */
const MessageDetailPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get WebSocket connection and message handlers
  const { 
    sendMessage, 
    lastMessage, 
    connectionStatus,
    sendTypingIndicator
  } = useMessageWebSocket(threadId);
  
  const { user } = useAuthStore();
  
  // Fetch conversation data
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // Fetch chat from chat service
        const chat = await chatApi.getChat(threadId);
        const other = chat.participants?.find(p => p.userId !== user?._id) || chat.participants?.[0] || {};
        setConversation({
          id: chat.chatId,
          name: other.name || 'User',
          avatar: other.avatar || '',
          online: false,
          _id: other.userId // Add the user ID for the shop icon
        });
        setMessages(chat.messages || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setFetchError(true);
        setLoading(false);
      }
    };
    
    fetchConversation();
  }, [threadId, user?._id]);
  
  // Process incoming messages from WebSocket
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'message') {
        // Add the new message to the conversation
        setMessages(prev => [...prev, {
          id: String.raw`m${Date.now()}`,
          sender: 'them',
          content: lastMessage.content,
          timestamp: new Date().toISOString(),
          status: 'received'
        }]);
      } else if (lastMessage.type === 'typing') {
        // Show typing indicator
        setIsTyping(lastMessage.isTyping);
      }
    }
  }, [lastMessage]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    
    // Generate a client-side message ID to track this message
    const clientMsgId = String.raw`m${Date.now()}`;
    
    // Create temporary message object for optimistic UI update
    const tempMessage = {
      id: clientMsgId,
      sender: 'me',
      content,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    // Add to messages state (optimistic update)
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // Actually save the message to the database
      const savedMessage = await chatApi.sendMessage({
        chatId: threadId,
        senderId: user?._id,
        senderName: user?.name || 'Me',
        senderAvatar: user?.profileImage || '',
        text: content,
        clientMsgId
      });
      
      // Update message status to delivered after successful save
      setMessages(prev => 
        prev.map(msg => 
          msg.id === clientMsgId
            ? { 
                ...msg, 
                id: savedMessage._id || clientMsgId,
                status: 'delivered' 
              } 
            : msg
        )
      );
      
      // Also send via WebSocket for real-time updates to other users
      sendMessage(content);
      
      // After a delay, update to "read" status
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === clientMsgId 
              ? { ...msg, status: 'read' } 
              : msg
          )
        );
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save message:', error);
      
      // Mark message as failed if API call fails
      setMessages(prev => 
        prev.map(msg => 
          msg.id === clientMsgId
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
    }
  };
  
  // Handle typing indicator
  const handleTyping = (isTyping) => {
    sendTypingIndicator(isTyping);
  };
  
  // Handle going back
  const handleGoBack = () => {
    // Navigate to MyEvents page with personal tab active
    navigate('/myevents', { state: { activeTab: 'personal' } });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="container mx-auto px-4 overflow-x-hidden">
            <div className="flex items-center h-16">
              <button 
                onClick={handleGoBack}
                className="text-indigo-600 mr-4"
                aria-label="Go back"
              >
                <FaArrowLeft />
              </button>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message area with loading skeleton */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 pt-4">
          <div className="container mx-auto px-4 overflow-x-hidden">
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index} 
                  className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`animate-pulse rounded-xl p-3 max-w-xs md:max-w-md
                    ${index % 2 === 0 ? 'bg-gray-200' : 'bg-indigo-100'}`}
                    style={{ width: `${Math.random() * 150 + 80}px`, height: `${Math.random() * 30 + 40}px` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Input area skeleton */}
        <div className="sticky bottom-0 z-10 bg-white border-t shadow-sm pb-20 md:pb-0">
          <div className="container mx-auto px-4 py-2">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Conversation not found (only show if explicit error)
  if (fetchError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="container mx-auto px-4 overflow-x-hidden">
            <div className="flex items-center h-16">
              <button 
                onClick={handleGoBack}
                className="text-indigo-600 mr-4"
                aria-label="Go back"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-xl font-semibold">Messages</h1>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center pb-20 md:pb-0">
          <div className="text-center p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Conversation Not Found</h2>
            <p className="text-gray-600 mb-4">
              The conversation you're looking for does not exist or has been deleted.
            </p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Personal Chats
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Consistent header */}
      <UserChatHeader user={{ 
        name: conversation.name, 
        avatar: conversation.avatar, 
        online: conversation.online,
        _id: conversation._id // Pass the user ID to UserChatHeader
      }} onBack={handleGoBack} />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 pt-20 md:pb-24">
        <div className="container mx-auto px-4 overflow-x-hidden">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?._id || message.sender === user?._id || message.sender === 'me';
              return (
                <MessageBubble
                  key={message._id || message.id}
                  message={message}
                  isOwn={isOwn}
                  avatar={conversation.avatar}
                />
              );
            })}
            {isTyping && <MessageTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Message input */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow-sm">
        <div className="container mx-auto px-4 py-2 overflow-x-hidden">
          <div className="max-w-3xl mx-auto">
            <MessageInput 
              onSendMessage={handleSendMessage} 
              onTyping={handleTyping}
              connectionStatus={connectionStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailPage;
