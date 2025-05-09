import React from 'react';

/**
 * GroupHeader component displays the event (group) name and photo in the chat header.
 * @param {Object} props
 * @param {Object} props.event - The event object containing title and imageUrl
 * @param {Function} props.onClick - Function to call when header is clicked
 */

const GroupHeader = ({ event, onClick }) => {
  console.log('[GroupHeader] event:', event);
  if (!event) return null;
  // Get event ID (support both _id and id formats)
  const eventId = event._id || event.id;
  // Get event title (support both title and eventName formats)
  const eventTitle = event.title || event.eventName || "Event";
  // Get event image (support multiple image field names)
  const eventImage = event.event_image || event.thumbnail || event.imageUrl || "/default-group.png";
  
  // Truncate event title to 25 characters (increased from 21)
  const displayTitle = eventTitle.length > 25 
    ? `${eventTitle.substring(0, 25)}...` 
    : eventTitle;
  
  console.log('[GroupHeader] Using eventId:', eventId, 'title:', eventTitle);
  
  return (
    <button
      className="flex items-center gap-3 group focus:outline-none w-full transition-all duration-300 justify-start"
      onClick={onClick}
      aria-label={`View details for ${eventTitle}`}
      type="button"
    >
      <div className="relative flex-shrink-0">
        <img
          src={eventImage}
          alt={eventTitle}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50 group-hover:brightness-95 group-focus:brightness-95 transition-all duration-300 shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex flex-col items-start flex-grow min-w-0 text-left">
        <span 
          className="font-semibold text-base text-gray-800 group-hover:text-indigo-600 group-focus:text-indigo-600 transition-colors duration-300 overflow-hidden text-ellipsis whitespace-nowrap w-full text-left"
          title={eventTitle} // Show full title on hover
        >
          {displayTitle}
        </span>
        <span className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap w-full text-left">
          Click here for Group Info
        </span>
      </div>
    </button>
  );
};

export default GroupHeader;
