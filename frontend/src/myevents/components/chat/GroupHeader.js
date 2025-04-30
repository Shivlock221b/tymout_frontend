import React from 'react';

/**
 * GroupHeader component displays the event (group) name and photo in the chat header.
 * @param {Object} props
 * @param {Object} props.event - The event object containing title and imageUrl
 * @param {Function} props.onClick - Function to call when header is clicked (e.g., to navigate to dashboard)
 */
import { useNavigate } from 'react-router-dom';

const GroupHeader = ({ event }) => {
  console.log('[GroupHeader] event:', event);
  const navigate = useNavigate();
  if (!event) return null;
  // Get event ID (support both _id and id formats)
  const eventId = event._id || event.id;
  // Get event title (support both title and eventName formats)
  const eventTitle = event.title || event.eventName || "Event";
  // Get event image (support multiple image field names)
  const eventImage = event.event_image || event.thumbnail || event.imageUrl || "/default-group.png";
  
  console.log('[GroupHeader] Using eventId:', eventId, 'title:', eventTitle);
  
  return (
    <button
      className="flex items-center gap-2 group focus:outline-none"
      onClick={() => navigate(`/myevents/about/${eventId}`)}
      aria-label={`View details for ${eventTitle}`}
      type="button"
    >
      <img
        src={eventImage}
        alt={eventTitle}
        className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50 group-hover:brightness-90 group-focus:brightness-90 transition"
      />
      <span className="font-semibold text-base text-primary truncate group-hover:underline group-focus:underline">
        {eventTitle}
      </span>
    </button>
  );
};

export default GroupHeader;
