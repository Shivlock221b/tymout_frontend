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
    <div className="p-4 text-gray-700 space-y-6 overflow-x-hidden">
      {/* About section */}
      <div>
        <h2 className="font-semibold mb-2">About this event</h2>
        <p className="whitespace-pre-line break-words break-all">{event.description || 'No description available.'}</p>
      </div>

      {/* Event Details */}
      <div className="space-y-3">
        <h3 className="font-semibold">Event Details</h3>

        {/* Location */}
        <div className="space-y-1">
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 break-words">
              {event?.place?.name && (
                <div className="font-medium">{event.place.name}</div>
              )}
              <div>{event?.place?.address || event.location?.city || 'Location not specified'}</div>
            </div>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 max-w-full break-words"
            >
              <FaMapMarkerAlt className="mr-1.5" />
              Open in Google Maps
              <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
            </a>
          )}
        </div>

        {/* Basic info grid */}
        <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
          <div className="text-gray-500">Date:</div>
          <div className="min-w-0 break-words">{event.date?.start ? new Date(event.date.start).toLocaleDateString() : (event.date || 'Not specified')}</div>

          <div className="text-gray-500">Attendees:</div>
          <div className="min-w-0">{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}</div>

          {event.capacity && (
            <>
              <div className="text-gray-500">Capacity:</div>
              <div className="min-w-0">{event.capacity}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default AboutTab;
