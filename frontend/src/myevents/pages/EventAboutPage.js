import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMyEvents } from '../hooks/queries/useMyEventsQueries';
import AboutTab from '../components/chat/AboutTab';

/**
 * EventAboutPage Component
 * 
 * Displays detailed information about an event using the AboutTab component
 */
const EventAboutPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // Fetch user's events and find the current event
  const { data: events = [], isLoading, isError } = useMyEvents();
  
  // Find event by either _id or id
  const event = events.find(e => {
    const eventIdField = e._id || e.id;
    return String(eventIdField) === String(eventId);
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-[600px] mx-auto relative">
        <div className="p-4 text-center text-gray-500">Loading event details...</div>
      </div>
    );
  }
  
  // Error state
  if (isError || !event) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-[600px] mx-auto relative">
        <div className="p-4 text-center text-red-500">Failed to load event details.</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white max-w-[600px] mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-3 flex items-center gap-3">
        <button
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={() => navigate(-1)}
          aria-label="Back"
          type="button"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <img
            src={event.thumbnail || event.imageUrl || event.event_image || "/default-group.png"}
            alt={event.title || event.eventName || "Event"}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"
          />
          <span className="font-semibold text-base text-primary truncate">
            {event.title || event.eventName || "Event"}
          </span>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <AboutTab event={event} />
      </div>
    </div>
  );
};

export default EventAboutPage;
