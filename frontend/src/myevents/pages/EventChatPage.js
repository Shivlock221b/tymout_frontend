import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInputBox from '../components/chat/ChatInputBox';
import GroupHeader from '../components/chat/GroupHeader';
import MomentsTab from '../components/chat/MomentsTab';
import MembersTab from '../components/chat/MembersTab';
import AboutTab from '../components/chat/AboutTab';

import { useMyEvents } from '../hooks/queries/useMyEventsQueries';
import { useAuthStore } from '../../stores/authStore';
import { useChatSocket } from '../hooks/useChatSocket';
import { useEventMembersQuery } from '../hooks/queries/useEventMembersQuery';


const EventChatPage = () => {
  // Add meta viewport tag to prevent zooming when keyboard opens
  useEffect(() => {
    // Get existing viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Set viewport properties to prevent zooming
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Cleanup function to restore original viewport settings
    return () => {
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
    };
  }, []);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('groupinfo');
  
  // State for showing group tabbed interface
  const [showGroupTabs, setShowGroupTabs] = useState(false);
  
  console.log('EventChatPage mounted.');
  const { eventId } = useParams();
  console.log('EventChatPage useParams eventId:', eventId);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Fetch user's events and find the current event from backend
  const { data: events = [] } = useMyEvents();
  const { data: members = [] } = useEventMembersQuery(eventId);
  console.log('Fetched events from useMyEvents:', events);
  
  // Find event by either _id or id, with detailed logging
  const event = events.find(e => {
    const eventIdField = e._id || e.id;
    console.log('Comparing event ID:', eventIdField, 'with param:', eventId, 'match:', String(eventIdField) === String(eventId));
    return String(eventIdField) === String(eventId);
  });
  
  console.log('Resolved event from events list:', event);
  // useChatSocket returns an array of message objects as per the backend structure
  const { messages, sendMessage } = useChatSocket(eventId);
  const [input, setInput] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);

  const handleSend = (text) => {
    if (!text.trim()) return;
    sendMessage(text, replyToMessage);
    setReplyToMessage(null);
    setInput('');
  };

  const handleReplyTo = (message) => {
    setReplyToMessage(message);
    // Focus on input field after selecting a message to reply to
    document.querySelector('textarea')?.focus();
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  // Debug: Log the event object to inspect its structure
  console.log('EventChatPage event:', event);

  // Add global styles for the chat background
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .chat-background-container {
        position: relative;
      }
      
      .chat-background-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/hero/jap0.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.50;
        z-index: 0;
        pointer-events: none;
      }
      
      .chat-header-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 40;
        max-width: 600px;
        width: 100%;
        margin: 0 auto;
        transition: all 0.3s ease;
      }
      
      .chat-header-glass {
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        padding: 12px;
        transition: all 0.3s ease;
      }
      
      .chat-header-content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        width: 100%;
        padding: 0 4px;
      }
    `;
    
    // Append the style element to the head
    document.head.appendChild(styleElement);
    
    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const headerContainer = document.querySelector('.chat-header-container');
      const headerGlass = document.querySelector('.chat-header-glass');
      
      if (headerContainer && headerGlass) {
        if (window.scrollY > 10) {
          headerGlass.style.borderBottomLeftRadius = '16px';
          headerGlass.style.borderBottomRightRadius = '16px';
          headerGlass.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        } else {
          headerGlass.style.borderBottomLeftRadius = '0';
          headerGlass.style.borderBottomRightRadius = '0';
          headerGlass.style.boxShadow = 'none';
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showGroupTabs) {
    return (
      <div className="flex flex-col h-screen bg-white max-w-[600px] mx-auto relative">
        {/* Header (back button + consistent GroupHeader) */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-3 flex items-center gap-3">
          {/* Back Button */}
          <button
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            onClick={() => setShowGroupTabs(false)}
            aria-label="Back to Chat"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Group header styled same as chat */}
          <GroupHeader event={event} onClick={() => {}} />
        </div>
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 bg-white sticky top-16 z-30">
          <button
            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${activeTab === 'groupinfo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('groupinfo')}
          >
            Group Info
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${activeTab === 'moments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('moments')}
          >
            Moments
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors ${activeTab === 'members' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        </div>
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden pt-2">
          {activeTab === 'groupinfo' && (
            <div className="flex-1 overflow-y-auto">
              <AboutTab event={event} />
            </div>
          )}
          {activeTab === 'moments' && (
            <div className="flex-1 overflow-y-auto">
              <MomentsTab eventId={eventId} />
            </div>
          )}
          {activeTab === 'members' && (
            <div className="flex-1 overflow-y-auto">
              <MembersTab members={members} event={event} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white max-w-[600px] mx-auto relative chat-background-container">
      {/* Header with glassy effect */}
      <div className="chat-header-container">
        <div className="chat-header-glass">
          <div className="chat-header-content">
            <button
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none flex-shrink-0"
              onClick={() => navigate('/myevents')}
              aria-label="Back"
              type="button"
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {event && (
              <GroupHeader event={event} onClick={() => setShowGroupTabs(true)} />
            )}
          </div>
        </div>
      </div>
      
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      {/* Chat messages with scrolling */}
      <div className="flex-1 overflow-y-auto pb-16 z-10 relative">
        <ChatMessageList 
          messages={messages} 
          currentUserId={user?._id} 
          otherPhoto={event?.thumbnail} 
          onReplyTo={handleReplyTo}
          eventId={eventId}
        />
      </div>
      {/* Input box - fixed to viewport bottom for consistent behavior across webviews */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-2 py-2 z-20 max-w-[600px] mx-auto">
        <ChatInputBox 
          onSend={handleSend} 
          value={input} 
          onChange={setInput} 
          replyToMessage={replyToMessage}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  );
};

export default EventChatPage;
