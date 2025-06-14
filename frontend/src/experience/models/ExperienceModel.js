/**
 * Experience Data Model
 * Defines the structure and validation for Experience objects
 */

import PropTypes from 'prop-types';

// Host object structure
export const HostPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  rating: PropTypes.number
});

// Location object structure
export const LocationPropType = PropTypes.shape({
  city: PropTypes.string.isRequired,
  place: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  coordinates: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  })
});

// Main Experience PropType definition
export const ExperiencePropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  host: HostPropType.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired, // in minutes
  maxAttendees: PropTypes.number.isRequired,
  currentAttendees: PropTypes.number.isRequired,
  location: LocationPropType.isRequired,
  price: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  tags: PropTypes.arrayOf(PropTypes.string),
  isPrivate: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(['upcoming', 'ongoing', 'completed', 'cancelled']).isRequired
});

// Experience object structure (for documentation purposes)
export const ExperienceStructure = {
  id: 'string',                  // Unique identifier 
  title: 'string',               // Title of the experience
  description: 'string',         // Detailed description
  category: 'string',            // Category type (Culinary, Adventure, etc)
  host: {                        // Host information
    id: 'string',                // Host unique identifier
    name: 'string',              // Host name
    avatar: 'string',            // Host profile image URL
    rating: 'number'             // Host rating (0-5)
  },
  date: 'string',                // Date in YYYY-MM-DD format
  time: 'string',                // Time in 24-hour format (HH:MM)
  duration: 'number',            // Duration in minutes
  maxAttendees: 'number',        // Maximum number of participants
  currentAttendees: 'number',    // Current number of participants
  location: {                    // Location information
    city: 'string',              // City name
    place: 'string',             // Venue name
    address: 'string',           // Full address
    coordinates: {               // Geographic coordinates
      lat: 'number',             // Latitude
      lng: 'number'              // Longitude
    }
  },
  price: 'number',               // Price value
  currency: 'string',            // Currency code (INR, USD, etc)
  images: ['string'],            // Array of image URLs
  tags: ['string'],              // Array of tags/keywords
  isPrivate: 'boolean',          // Whether experience is private
  status: 'string'               // Status (upcoming, ongoing, completed, cancelled)
};

export default ExperiencePropType;
