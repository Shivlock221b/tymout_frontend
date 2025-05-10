import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SpotlightEvents Component
 * 
 * Displays a horizontally scrollable grid of event thumbnails
 * with event names below them.
 */
const SpotlightEvents = ({ events }) => {
  const navigate = useNavigate();

  // Handle navigation to event details
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // If no events are provided or no spotlight events are found, don't render anything
  if (!events || !Array.isArray(events) || events.length === 0) {
    return null;
  }
  
  // For a small number of events, adjust the layout to avoid empty space
  const useCompactLayout = events.length <= 3;

  // Helper function to format date with fallbacks for different date formats
  const formatEventDate = (event) => {
    let dateDisplay = "";
    if (event.date) {
      const eventDate = new Date(event.date);
      if (!isNaN(eventDate.getTime())) {
        dateDisplay = eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } else if (event.startDate) {
      const eventDate = new Date(event.startDate);
      if (!isNaN(eventDate.getTime())) {
        dateDisplay = eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
    return dateDisplay;
  };

  // Render a single event card
  const renderEventCard = (event, index, groupIndex = null) => {
    // Get event details with fallbacks for different property names
    const eventId = event.id || event._id;
    const title = event.title || event.eventName || "Event";
    const image = event.image || event.event_image || event.thumbnail || "/default-event.png";
    const dateDisplay = formatEventDate(event);
    
    const key = eventId || (groupIndex !== null ? `event-${groupIndex}-${index}` : `event-${index}`);
    const className = useCompactLayout 
      ? "cursor-pointer transition-transform duration-200 hover:scale-105 w-28 md:w-32" 
      : "cursor-pointer transition-transform duration-200 hover:scale-105";
    
    return (
      <div 
        key={key}
        className={className}
        onClick={() => handleEventClick(eventId)}
      >
        {/* Rectangular image */}
        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 shadow-sm">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-event.png";
            }}
          />
        </div>
        {/* Event name */}
        <p className="mt-1 text-xs font-medium text-gray-800 line-clamp-1">
          {title}
        </p>
        {/* Event date */}
        {dateDisplay && (
          <p className="text-xs text-gray-500 -mt-0.5">
            {dateDisplay}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex items-center mb-3 px-4">
        <h2 className="text-lg font-bold text-gray-800">In the Spotlight ✨</h2>
      </div>
      
      {/* Horizontally scrollable container */}
      <div className="overflow-x-auto pb-4 no-scrollbar">
        <div className="flex px-4 space-x-4">
          {useCompactLayout ? (
            // Single-row layout for 3 or fewer events
            <div className="flex space-x-4">
              {events.map((event, index) => renderEventCard(event, index))}
            </div>
          ) : (
            // 2×3 grid layout for more events
            <div className="flex space-x-8" style={{ minWidth: 'max-content' }}>
              {Array.from({ length: Math.ceil(events.length / 6) }).map((_, groupIndex) => {
                const groupEvents = events.slice(groupIndex * 6, groupIndex * 6 + 6);
                
                return (
                  <div key={`group-${groupIndex}`} className="flex-shrink-0 w-80 md:w-96">
                    <div className="grid grid-cols-3 gap-3">
                      {/* Render event cards */}
                      {groupEvents.map((event, index) => renderEventCard(event, index, groupIndex))}
                      
                      {/* Fill empty slots with placeholders if needed */}
                      {Array.from({ length: 6 - groupEvents.length }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="aspect-[4/3] invisible">
                          {/* Invisible placeholder to maintain grid structure */}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotlightEvents;
