import React, { useState } from 'react';
import { useMyEvents } from '../hooks/queries/useMyEventsQueries';
import MyEventTicketCard from './MyEventTicketCard';
import { isPast } from 'date-fns';
import { FaSearch } from 'react-icons/fa';

const MyEventsPage = () => {
  const { data: events = [], isLoading, isError } = useMyEvents();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Debug: Log the events data structure to the console
  console.log('[MyEventsPage] events:', events);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with title and search */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Chat</h1>
        
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
            className={`px-4 py-2 rounded-full font-medium text-base transition 
              ${activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
              }`}
          >
            My Tables
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-full font-medium text-base transition 
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
            Archieve
          </button>
        </div>
      </div>

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
          {filteredEvents.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow-sm">
              <MyEventTicketCard 
                event={event} 
                isPending={activeTab === 'pending'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
