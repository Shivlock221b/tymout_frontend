import React from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaUser, FaTag, FaClock, FaCalendarAlt, FaUsers, FaDirections, FaExternalLinkAlt, FaBullhorn } from 'react-icons/fa';

/**
 * EventDetailInfo Component
 * 
 * Following the Single Responsibility Principle:
 * This component handles displaying detailed information about an event/table/circle
 */
const EventDetailInfo = ({ item, type }) => {
  // Determine the appropriate content label based on type
  const getTypeLabel = () => {
    switch (type) {
      case 'tables':
        return 'Table';
      case 'events':
        return 'Event';
      case 'circles':
        return 'Circle';
      default:
        return 'Item';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">About this {getTypeLabel()}</h2>
      <p className="text-gray-700 mb-6">{item.description}</p>
      
      {/* Date and Time */}
      {(item.date || item.time) && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">When</h3>
          <div className="flex flex-wrap gap-6">
            {item.date && (
              <div className="flex items-center">
                <FaCalendarAlt className="text-indigo-600 mr-2" />
                <span>{item.date}</span>
              </div>
            )}
            {item.time && (
              <div className="flex items-center">
                <FaClock className="text-indigo-600 mr-2" />
                <span>{item.time}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Location */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Location</h3>
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-indigo-600 mr-2" />
            {item.place?.name ? (
              <span className="font-medium">{item.place.name}</span>
            ) : (
              <span>{item.location}</span>
            )}
            {item.distance && (
              <span className="ml-2 text-sm text-gray-500">({item.distance} km away)</span>
            )}
          </div>
          
          {/* Address if available */}
          {item.place?.address && (
            <div className="ml-6 text-gray-600 mb-2">
              {item.place.address}
            </div>
          )}
          
          {/* Google Maps Button */}
          {(item.place?.coordinates?.latitude && item.place?.coordinates?.longitude) ? (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${item.place.coordinates.latitude},${item.place.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-fit"
            >
              <FaMapMarkerAlt className="mr-1.5" />
              Open in Google Maps
              <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
            </a>
          ) : item.place?.name ? (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.place.name}, ${item.location}, India`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-fit"
            >
              <FaMapMarkerAlt className="mr-1.5" />
              Open in Google Maps
              <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
            </a>
          ) : item.location ? (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.location}, India`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-fit"
            >
              <FaMapMarkerAlt className="mr-1.5" />
              Open in Google Maps
              <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>
      
      {/* Participants */}
      {(item.participants || item.maxParticipants || item.attendees) && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Participants</h3>
          <div className="flex items-center">
            <FaUsers className="text-indigo-600 mr-2" />
            <span>
              {item.participants || item.attendees || 0}
              {item.maxParticipants ? ` / ${item.maxParticipants} max` : ''}
            </span>
          </div>
        </div>
      )}
      
      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
              >
                <FaTag className="mr-1 text-indigo-600 text-xs" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Announcements */}
      {item.announcement && item.announcement.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2 flex items-center">
            <FaBullhorn className="text-indigo-600 mr-2" />
            Announcements
          </h3>
          <div className="space-y-3">
            {item.announcement.map((announcement, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                {/* Text announcement */}
                {announcement.type === 'text' && (
                  <p className="text-gray-700">{announcement.caption}</p>
                )}
                
                {/* Image announcement */}
                {announcement.type === 'image' && announcement.url && (
                  <div>
                    <img 
                      src={announcement.url} 
                      alt={announcement.caption || 'Event announcement'} 
                      className="w-full h-auto rounded-lg mb-2 max-h-64 object-cover"
                    />
                    {announcement.caption && (
                      <p className="text-gray-700 mt-2">{announcement.caption}</p>
                    )}
                  </div>
                )}
                
                {/* Video announcement */}
                {announcement.type === 'video' && announcement.url && (
                  <div>
                    <video 
                      src={announcement.url} 
                      controls 
                      className="w-full h-auto rounded-lg mb-2"
                    />
                    {announcement.caption && (
                      <p className="text-gray-700 mt-2">{announcement.caption}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

EventDetailInfo.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired
};

export default EventDetailInfo;
