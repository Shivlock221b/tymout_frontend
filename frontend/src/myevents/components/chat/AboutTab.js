import React from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * AboutTab displays general information about an event
 */
const AboutTab = ({ event }) => {
  // Get attendee count safely (handle both array and number formats)
  const attendeeCount = Array.isArray(event.attendees) 
    ? event.attendees.length 
    : (typeof event.attendees === 'number' ? event.attendees : 0);

  // Function to create Google Maps URL from coordinates
  const getGoogleMapsUrl = () => {
    if (event?.place?.coordinates?.latitude && event?.place?.coordinates?.longitude) {
      const { latitude, longitude } = event.place.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    // Fallback to search by place name and city
    if (event?.place?.name && event?.location?.city) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.place.name}, ${event.location.city}, India`
      )}`;
    }
    // Fallback to just city
    if (event?.location?.city) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.location.city}, India`
      )}`;
    }
    return null;
  };

  const mapsUrl = getGoogleMapsUrl();

  return (
    <div className="p-4 text-gray-700">
      <div className="font-semibold mb-2">About this event</div>
      <div className="mb-4">{event.description || 'No description available.'}</div>
      
      {/* Event details */}
      <div className="mt-4">
        <div className="font-semibold mb-2">Event Details</div>
        
        {/* Location with Google Maps button */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-indigo-600 mr-2" />
            <span className="font-medium">Location</span>
          </div>
          <div className="ml-6 mb-2">
            {event?.place?.name ? (
              <div className="font-medium">{event.place.name}</div>
            ) : null}
            <div>{event?.place?.address || event.location?.city || 'Location not specified'}</div>
          </div>
          
          {mapsUrl && (
            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaMapMarkerAlt className="mr-1.5" />
              Open in Google Maps
              <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
            </a>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Date:</div>
          <div>{event.date?.start ? new Date(event.date.start).toLocaleDateString() : (event.date || 'Not specified')}</div>
          
          <div className="text-gray-500">Attendees:</div>
          <div>{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}</div>
          
          {event.capacity && (
            <>
              <div className="text-gray-500">Capacity:</div>
              <div>{event.capacity}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default AboutTab;
