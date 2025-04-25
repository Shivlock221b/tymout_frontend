import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEllipsisV, FaPhone, FaVideo } from 'react-icons/fa';

// Import components for message UI
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import MessageTypingIndicator from '../components/MessageTypingIndicator';

// Import mock data - following the mock data separation rule


// Import WebSocket service
import { useMessageWebSocket } from '../services/messageWebSocketService';

// TODO: Replace this placeholder with real data import/API call when backend is ready
let messageDetailData = {};

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
  
  // Fetch conversation data
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // In a production app, this would be an API call
        // const response = await api.get(`/messages/threads/${threadId}`);
        // setConversation(response.data);
        // setMessages(response.data.messages);
        
        // Using mock data for development
        setTimeout(() => {
          if (messageDetailData[threadId]) {
            setConversation(messageDetailData[threadId]);
            setMessages(messageDetailData[threadId].messages || []);
          }
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setLoading(false);
      }
    };
    
    fetchConversation();
  }, [threadId]);
  
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
  const handleSendMessage = (content) => {
    if (!content.trim()) return;
    
    // Create new message object
    const newMessage = {
      id: String.raw`m${Date.now()}`,
      sender: 'me',
      content,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    // Add to messages state
    setMessages(prev => [...prev, newMessage]);
    
    // Send via WebSocket
    sendMessage(content);
    
    // After a delay, update the message status to reflect delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      );
      
      // After another delay, update to "read" status
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'read' } 
              : msg
          )
        );
      }, 2000);
    }, 1000);
  };
  
  // Handle typing indicator
  const handleTyping = (isTyping) => {
    sendTypingIndicator(isTyping);
  };
  
  // Handle going back
  const handleGoBack = () => {
    navigate('/messages');
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
  
  // Conversation not found
  if (!conversation) {
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
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Conversation header */}
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
            
            <div className="flex items-center flex-1">
              <div className="relative">
                <img 
                  src={conversation.avatar} 
                  alt={conversation.name} 
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40?text=User';
                  }}
                />
                {conversation.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3">
                <h2 className="font-medium">{conversation.name}</h2>
                <p className="text-xs text-gray-500">
                  {conversation.online ? 'Online' : 'Offline'}
                  {isTyping && ' • Typing...'}
                </p>
              </div>
            </div>
            
            <div className="flex">
              <button className="p-2 text-gray-600 hover:text-indigo-600 transition" aria-label="Call">
                <FaPhone />
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600 transition" aria-label="Video call">
                <FaVideo />
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600 transition" aria-label="More options">
                <FaEllipsisV />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 pt-4 md:pb-16">
        <div className="container mx-auto px-4 overflow-x-hidden">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender === 'me'}
              />
            ))}
            {isTyping && <MessageTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Message input */}
      <div className="sticky bottom-0 z-10 bg-white border-t shadow-sm pb-20 md:pb-0">
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
