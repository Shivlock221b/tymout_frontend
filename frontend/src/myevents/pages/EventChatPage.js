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
  
  // Reference to the chat container
  const chatContainerRef = React.useRef(null);
  
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
  
  // Force scroll to bottom when messages are loaded
  useEffect(() => {
    if (messages && messages.length > 0 && chatContainerRef.current) {
      console.log('EventChatPage: Messages loaded, scrolling to bottom');
      // Use a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

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
    <div className="flex flex-col h-screen bg-white max-w-[600px] mx-auto relative">
      {/* Header - position sticky instead of fixed */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-3 flex items-center gap-3">
        <button
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
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
      
      {/* Chat messages with scrolling - with improved padding for keyboard */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto z-10" 
        style={{ paddingBottom: '20px' }}
      >
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
