import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';

/**
 * AboutTab displays general information about an event
 */
const AboutTab = ({ event }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();
  
  // Get current user from auth store
  const currentUser = useAuthStore(state => state.user);
  
  // Check if current user is the host of the event
  useEffect(() => {
    if (!currentUser || !event || !event.host) return;
    
    // Check different possible host structures
    if (typeof event.host === 'object') {
      // If host is an object with userId
      if (event.host.userId) {
        setIsHost(event.host.userId.toString() === currentUser._id.toString());
      } else if (event.host._id) {
        setIsHost(event.host._id.toString() === currentUser._id.toString());
      } else if (event.host.id) {
        setIsHost(event.host.id.toString() === currentUser._id.toString());
      }
    } else {
      // If host is just an ID string
      setIsHost(event.host.toString() === currentUser._id.toString());
    }
  }, [currentUser, event]);
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
          
          {/* Delete Event Button - Only visible to host */}
          {isHost && (
            <>
              <div className="text-gray-500 mt-4">Host Actions:</div>
              <div>
                <button 
                  onClick={() => setShowConfirmation(true)}
                  className="flex items-center px-3 py-1.5 mt-1 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  <FaTrash className="mr-1.5" />
                  {isDeleting ? 'Deleting...' : 'Delete Event'}
                </button>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            </>
          )}
          
          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-5 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Event</h3>
                <p className="text-gray-500 mb-4">Are you sure you want to delete this event? This action is irreversible and all event data will be permanently removed.</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsDeleting(true);
                        setError(null);
                        
                        // Get the event ID (handle different ID formats)
                        const eventId = event._id || event.id;
                        
                        // Call the API to delete the event
                        await axios.delete(`${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:5000'}/api/events/${eventId}`);
                        
                        // Redirect to explore page
                        navigate('/explore');
                        // Force reload to refresh the events list
                        window.location.reload();
                      } catch (err) {
                        console.error('Error deleting event:', err);
                        setError('Failed to delete event. Please try again.');
                        setIsDeleting(false);
                        setShowConfirmation(false);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
export default AboutTab;
