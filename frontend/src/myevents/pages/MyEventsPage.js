import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMyEvents } from '../hooks/queries/useMyEventsQueries';
import MyEventTicketCard from './MyEventTicketCard';
import { isPast } from 'date-fns';
import { FaSearch } from 'react-icons/fa';
import { useChatPreviews } from '../hooks/queries/useChatPreviewQuery';
import { queryClient } from '../../query/queryClient';
import { io } from 'socket.io-client';
// Personal chat functionality will be implemented in the future
// import PersonalChatCard from '../components/PersonalChatCard';
// import { useAuthStore } from '../../stores/authStore'; // Will be used when personal chat functionality is implemented
// Chat API will be used when personal chat functionality is implemented
// import chatApi from '../../message/services/chatApi';

// useAuthStore import removed as it's not being used

const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';

const MyEventsPage = () => {
  const { data: events = [], isLoading, isError } = useMyEvents();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'upcoming');
  
  // Reset location state after using it
  useEffect(() => {
    if (location.state?.activeTab) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [searchQuery, setSearchQuery] = useState('');
  // currentUserId removed as it's not being used
  // const currentUserId = useAuthStore(state => state.user?._id);

  // Helper function to check if an event is in the past
  const isEventPast = (event) => {
    if (!event.date || !event.date.start) return false;
    return isPast(new Date(event.date.start));
  };

  // Filter events based on the active tab and search query
  const filteredEvents = events.filter(event => {
    // First filter by tab
    const matchesTab = activeTab === 'archieve' ? 
      isEventPast(event) : 
      activeTab === 'pending' ? 
        (event.status === 'pending' || event.status === 'rejected') :
        (!isEventPast(event) && (event.status === 'accepted' || !event.status));
    
    // Then filter by search query if there is one
    const matchesSearch = searchQuery.trim() === '' || 
      (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Get chat previews (unread counts) for all filtered events
  const eventIds = filteredEvents.map(event => event._id);
  const { chatPreviews } = useChatPreviews(eventIds);

  // Personal one-on-one chats state - will be implemented in the future
  // const { user } = useAuthStore(); // Will be used when personal chat functionality is implemented
  /* Personal chat functionality will be implemented in the future
  const [personalChats, setPersonalChats] = useState([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(true);

  useEffect(() => {
    const fetchPersonal = async () => {
      if (!user?._id) {
        setIsLoadingPersonal(false);
        return;
      }
      try {
        setIsLoadingPersonal(true);
        const chats = await chatApi.getUserChats(user._id);
        const formatted = (chats || []).map(chat => {
          const other = chat.otherUser || chat.participants?.find(p => p.userId !== user._id) || chat.participants?.[0] || {};
          const lastMsg = chat.lastMessage || {};
          return {
            id: chat.chatId || chat._id,
            name: other.name || 'User',
            avatar: other.avatar || 'https://via.placeholder.com/48?text=U',
            lastMessage: lastMsg.text || lastMsg,
            timestamp: lastMsg.timestamp || lastMsg.createdAt || chat.lastActivity || new Date().toISOString(),
            unread: chat.unreadCount || 0,
            online: other.online || false
          };
        });
        setPersonalChats(formatted);
      } catch (err) {
        console.error('Error loading personal chats', err);
        setPersonalChats([]);
      } finally {
        setIsLoadingPersonal(false);
      }
    };
    fetchPersonal();
  }, [user]);
  */

  // Real-time updates for unread counts and attendee status changes
  useEffect(() => {
    // Log the environment and URL being used
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Setting up socket connection to:', SOCKET_URL);
    
    // Enhanced socket connection with better options for production
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 30000,
      transports: ['websocket', 'polling'], // Try WebSocket first, then fallback to polling
      withCredentials: true, // Enable CORS credentials
      forceNew: true // Force a new connection
    });
    
    // Connection event handlers with improved logging
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
      // Force refetch chat previews on successful connection
      queryClient.refetchQueries({ queryKey: ['chatPreviews'], exact: false });
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.error('Socket connection error details:', {
        message: error.message,
        description: error.description,
        type: error.type
      });
      
      // Fallback: Periodically refetch chat previews even if socket fails
      const intervalId = setInterval(() => {
        console.log('Fallback: Refetching chat previews due to socket connection issues');
        queryClient.refetchQueries({ queryKey: ['chatPreviews'], exact: false });
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    // Listen for unread count changes
    socket.on('unreadCountsChanged', (data) => {
      console.log('Received unreadCountsChanged event:', data);
      queryClient.refetchQueries({ queryKey: ['chatPreviews'], exact: false });
    });
    
    // Listen for attendee status updates
    socket.on('attendeeStatusUpdated', (data) => {
      console.log('Received attendeeStatusUpdated event:', data);
      
      // Force immediate refetch of all relevant queries
      Promise.all([
        queryClient.refetchQueries({ queryKey: ['myEvents'], force: true }),
        queryClient.refetchQueries({ queryKey: ['eventsAttending'], force: true }),
        queryClient.refetchQueries({ queryKey: ['hostedEvents'], force: true })
      ]).then(() => {
        console.log('Successfully refetched all event data after status update');
      }).catch(error => {
        console.error('Error refetching event data:', error);
      });
    });
    
    // Send a test event after 5 seconds to verify socket is working
    const testTimer = setTimeout(() => {
      console.log('Sending test attendee update event');
      socket.emit('testAttendeeUpdate', { test: true, timestamp: new Date().toISOString() });
    }, 5000);
    
    return () => {
      clearTimeout(testTimer);
      socket.disconnect();
      console.log('Socket disconnected on component unmount');
    };
  }, []); // queryClient is stable and doesn't need to be in deps

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with title and search */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Chats</h1>
        
        <div className="relative w-full max-w-xs ml-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tag-style category navigation */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-full font-medium text-sm transition 
              ${activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
              }`}
          >
            My Tables
          </button>
          {/* Personal tab hidden - will be implemented in the future
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-full font-medium text-sm transition 
              ${activeTab === 'personal'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
              }`}
          >
            Personal
          </button>
          */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-full font-medium text-sm transition 
              ${activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
              }`}
          >
            Pending
          </button>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => setActiveTab('archieve')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-sm transition 
              ${activeTab === 'archieve'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 0H4" />
            </svg>
            Archive
          </button>
        </div>
      </div>

      {/* Personal tab content hidden - will be implemented in the future */}
      {isLoading ? (
        <div className="text-gray-500">Loading events...</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load events.</div>
      ) : !filteredEvents.length ? (
        <div className="text-gray-500">
          {searchQuery.trim() !== '' 
            ? `No chats matching "${searchQuery}".` 
            : `No ${activeTab === 'archieve' ? 'archieve' : activeTab} events found.`}
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {/* Use event._id as the key, assuming it's the unique ID */}
          {filteredEvents.map(event => {
            const preview = chatPreviews?.[event._id] || {};
            const showUnreadBadge = preview.unreadCount > 0;
            return (
              <div key={event._id} className="bg-white rounded-lg shadow-sm">
                <MyEventTicketCard 
                  event={event} 
                  isPending={activeTab === 'pending'}
                  unreadCount={preview.unreadCount || 0}
                  showUnreadBadge={showUnreadBadge}
                  lastMessage={preview.lastMessage}
                  lastMessageTime={preview.lastMessageTime}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
