import React, { useState } from 'react';
import { useMyEvents } from '../hooks/queries/useMyEventsQueries';
import MyEventTicketCard from './MyEventTicketCard';
import { isPast } from 'date-fns';

const MyEventsPage = () => {
  const { data: events = [], isLoading, isError } = useMyEvents();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Debug: Log the events data structure to the console
  console.log('[MyEventsPage] events:', events);

  // Helper function to check if an event is in the past
  const isEventPast = (event) => {
    if (!event.date || !event.date.start) return false;
    return isPast(new Date(event.date.start));
  };

  // Filter events based on the active tab
  const filteredEvents = events.filter(event => {
    if (activeTab === 'archieve') {
      return isEventPast(event);
    }
    // For pending events, show events with status 'pending'
    if (activeTab === 'pending') {
      return event.status === 'pending' || event.status === 'rejected';
    }
    // For upcoming tables, show all non-past events with status 'accepted'
    if (activeTab === 'upcoming') {
      return !isEventPast(event) && (event.status === 'accepted' || !event.status);
    }
    return false;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-primary">Messages</h1>
      
      {/* Tag-style category navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-full font-semibold text-base transition 
            ${activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
            }`}
        >
          My Tables
        </button>
        <button
          onClick={() => setActiveTab('archieve')}
          className={`px-4 py-2 rounded-full font-semibold text-base transition 
            ${activeTab === 'archieve'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
            }`}
        >
          Archieve
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-full font-semibold text-base transition 
            ${activeTab === 'pending'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
            }`}
        >
          Pending
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading events...</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load events.</div>
      ) : !filteredEvents.length ? (
        <div className="text-gray-500">No {activeTab === 'archieve' ? 'archieve' : activeTab} events found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Use event._id as the key, assuming it's the unique ID */}
          {filteredEvents.map(event => (
            <MyEventTicketCard 
              key={event._id} 
              event={event} 
              isPending={activeTab === 'pending'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
