import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaTag, FaClock, FaCalendarAlt, FaUsers, FaStar, FaComment } from 'react-icons/fa';
import useEventCard from '../../hooks/useEventCard';
import axios from 'axios';

/**
 * Universal EventCard Component
 * 
 * A consolidated card component that handles events, tables, and circles
 * with support for different layouts and styling variants.
 * 
 * Following SOLID principles:
 * - Single Responsibility: Only handles displaying cards with appropriate variations
 * - Open/Closed: Extensible for different card types without modifying the component
 * - Dependency Inversion: Uses props and hooks instead of hard-coded dependencies
 */
const EventCard = ({ 
  item, 
  size = 'medium', 
  source = 'explore', 
  type = 'event', 
  showDescription = true,
  fullWidth = false,
  variant = 'default',
  customActions = null,
  disableNavigation = false,
  hideHeader = false
}) => {
  // Using our custom hook instead of direct navigation and state management
  const { 
    handleCardClick, 
    handleProfileClick, 
    handlePrimaryAction,
    isPending
  } = useEventCard(source);
  
  // State for last message
  const [lastMessage, setLastMessage] = useState(null);
  
  // Extract properties safely with default empty object to prevent errors
  const {
    id = '',
    title = '',
    description = '',
    location = '',
    distance = '',
    participants = 0,
    maxParticipants = 0,
    tags = [],
    image = '',
    event_image = '', // Add event_image field
    host = {},
    date = '',
    time = '',
    recommendation = null,
    memberCount = 0,
    attendees = [],
    rating = 0,
    activity = '',
    place = {}, // Extract place data from item
    lastMessage: propLastMessage = null // Last message passed as prop
  } = item || {};
  
  // Fetch last message if not provided as prop
  useEffect(() => {
    // Skip if no item
    if (!item) return;
    
    const fetchLastMessage = async () => {
      // Only fetch for events and when in myevents context
      if (type === 'event' && source === 'myevents' && id && !propLastMessage) {
        const API_URL = `${process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020'}/api/messages`;
        
        try {
          const res = await axios.get(`${API_URL}/${id}/last`);
          if (res.data && res.data.text) {
            setLastMessage(res.data);
          }
        } catch (err) {
          console.error('Error fetching last message:', err);
        }
      } else if (propLastMessage) {
        // Use the last message passed as prop
        setLastMessage(propLastMessage);
      }
    };
    
    fetchLastMessage();
  }, [item, id, type, source, propLastMessage]);
  
  // Early return after all hooks are called
  if (!item) return null;
  
  // Use event_image as fallback if image is not available
  const displayImage = image || event_image;

  // Generate a unique element ID for this card
  const cardElementId = `${type}-card-${id}`;

  // Handle card click using our custom hook
  const onCardClick = () => {
    if (disableNavigation) return;
    handleCardClick(item, type);
  };

  // Handle click on profile section using our custom hook
  const onProfileClick = (e) => {
    if (disableNavigation) return;
    e.stopPropagation(); // Prevent card click
    const person = getPerson();
    handleProfileClick(item, person, type);
  };

  // Action button handlers with stop propagation to prevent card navigation
  const onPrimaryAction = (e) => {
    if (e) e.stopPropagation();
    handlePrimaryAction(id, type);
  };

  // Utility to truncate description to 8 words
  const getShortDescription = (desc) => {
    if (!desc) return '';
    const words = desc.split(' ');
    if (words.length <= 8) return desc;
    return words.slice(0, 8).join(' ') + '...';
  };

  // Different class sets based on card size
  const sizeClasses = {
    small: {
      card: fullWidth ? 'w-full' : 'max-w-xs',
      image: 'h-40',
      title: 'text-lg',
      description: 'line-clamp-2', // Limit to 2 lines for small cards
    },
    medium: {
      card: fullWidth ? 'w-full' : 'max-w-sm',
      image: 'h-48',
      title: 'text-xl',
      description: 'line-clamp-3', // Limit to 3 lines for medium cards
    },
    large: {
      card: fullWidth ? 'w-full' : 'max-w-md',
      image: 'h-56',
      title: 'text-2xl',
      description: 'line-clamp-4', // Limit to 4 lines for large cards
    }
  };

  const classes = sizeClasses[size] || sizeClasses.medium;

  // Get the primary action text
  const getPrimaryActionText = () => {
    if (isPending) return 'Processing...';
    switch (type) {
      case 'circle':
        return 'Join Circle';
      case 'table':
        return 'Join Table';
      case 'event':
      default:
        return 'RSVP';
    }
  };

  // Get the person title based on card type
  const getPersonTitle = () => {
    switch (type) {
      case 'circle':
        return 'admin';
      case 'table':
      case 'event':
      default:
        return 'host';
    }
  };

  // Get the appropriate person object (host, admin, etc.)
  const getPerson = () => {
    switch (type) {
      case 'circle':
        return item.admin || {};
      case 'table':
      case 'event':
      default:
        return host || item.organizer || {};
    }
  };

  // Get participant count
  const getParticipantCount = () => {
    switch (type) {
      case 'circle':
        return memberCount || 0;
      case 'event':
        // Handle attendees as either a number or an array
        if (Array.isArray(attendees)) {
          return attendees.length;
        }
        return attendees || participants || 0;
      case 'table':
      default:
        return participants || 0;
    }
  };

  // WhatsApp-style chat card layout for explore variant
  if (variant === 'explore') {
    return (
      <div 
        id={cardElementId}
        className="w-full bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer border border-gray-100"
        onClick={onCardClick}
      >
        {/* No host information at the top */}
        
        {/* WhatsApp-style chat card layout */}
        <div className="p-3 flex items-center">
          {/* Left: Event Image (as profile photo) */}
          <div className="flex-shrink-0 mr-3">
            <img 
              src={displayImage || (getPerson() && getPerson().image)} 
              alt={title || (getPerson() && getPerson().name) || 'Event'} 
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/48?text=Event'; // Fallback image
              }}
            />
          </div>
          
          {/* Right: Event Information */}
          <div className="flex-1 min-w-0">
            {/* Title and timestamp */}
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-base font-medium text-gray-900 truncate pr-2">{title}</h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">{date || time}</span>
            </div>
            
            {/* Short description */}
            <div className="flex items-start">
              <p className="text-xs text-gray-600 truncate">
                {getShortDescription(description)}
              </p>
            </div>
            
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-0.5 mb-0.5">
                {tags.slice(0, 3).map((tag, index) => {
                  // Array of tag color combinations with lighter backgrounds
                  const tagColors = [
                    { bg: 'bg-blue-50', text: 'text-blue-600' },
                    { bg: 'bg-green-50', text: 'text-green-600' },
                    { bg: 'bg-purple-50', text: 'text-purple-600' },
                    { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                  ];
                  
                  // Select a color based on the tag string to ensure consistency
                  const colorIndex = tag.length % tagColors.length;
                  const { bg, text } = tagColors[colorIndex];
                  
                  return (
                    <span
                      key={`tag-${index}`}
                      className={`${bg} ${text} text-[9px] px-1 py-0 rounded-full leading-tight inline-block`}
                    >
                      {tag}
                    </span>
                  );
                })}
                {tags.length > 3 && (
                  <span className="text-gray-400 text-[9px]">+{tags.length - 3}</span>
                )}
              </div>
            )}
            
            {/* Location or participant count with right-aligned host info */}
            <div className="mt-1 flex items-center justify-between w-full">
              <div className="flex items-center text-xs text-gray-500">
                {location || place?.name ? (
                  <>
                    <FaMapMarkerAlt className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="truncate">{place?.name || location}</span>
                  </>
                ) : (
                  <>
                    <FaUsers className="h-3 w-3 text-gray-400 mr-1" />
                    <span>{getParticipantCount()}{maxParticipants ? `/${maxParticipants}` : ''} participants</span>
                  </>
                )}
              </div>
              
              {/* Host information - right aligned */}
              {getPerson() && Object.keys(getPerson()).length > 0 && (
                <div 
                  className="flex items-center text-xs text-gray-500 ml-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick(e);
                  }}
                >
                  <span className="font-medium">Host: {getPerson().name}{getPerson().verified ? ' ✓' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default vertical layout (for onlyforyou and default variants)
  return (
    <div 
      id={cardElementId}
      className={`w-full ${classes.card} bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200`}
      onClick={onCardClick}
    >
      {/* Host/Admin Information - At the very top (for default and explore variants) */}
      {!hideHeader && (variant === 'default' || variant === 'explore') && getPerson() && Object.keys(getPerson()).length > 0 && (
        <div 
          className="py-4 px-5 bg-gray-50 flex items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          onClick={onProfileClick}
        >
          <img 
            src={getPerson().image} 
            alt={getPerson().name} 
            className="w-10 h-10 rounded-full object-cover mr-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/32?text=User'; // Fallback image
            }}
          />
          <div>
            <p className="text-sm font-medium mb-0.5">{getPerson().name}</p>
            <p className="text-xs text-gray-500">{getPersonTitle()} {getPerson().verified && '✓'}</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Card Image */}
        <div className={`relative ${classes.image} overflow-hidden`}>
          <img 
            src={displayImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">
              Image source: {image ? 'image' : (event_image ? 'event_image' : 'none')}
            </div>
          )}
        </div>
        
        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full hidden">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
        
        {/* Recommendation badge if applicable - moved below participant count */}
        {recommendation && (
          <div className="absolute top-10 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(recommendation.score * 100)}% Match
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Title */}
        <h3 className={`${classes.title} font-bold text-gray-800 mb-2`}>{title}</h3>
        
        {/* Description */}
        {showDescription && (
          <p className={`${classes.description} text-gray-600 mb-3 overflow-hidden`}>
            {getShortDescription(description)}
          </p>
        )}
        
        {/* Event Meta Information */}
        <div className="space-y-2 text-sm text-gray-500">
          {/* Date and Time */}
          {date && time && (
            <div className="flex items-center">
              <div className="flex items-center mr-3">
                <FaCalendarAlt className="mr-1 text-indigo-600" />
                <span>{date}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-1 text-indigo-600" />
                <span>{time}</span>
              </div>
            </div>
          )}
          
          {/* Location and Distance */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center truncate mr-2">
              <FaMapMarkerAlt className="mr-1 text-indigo-600" />
              <span className="truncate">{location}</span>
            </div>
            {distance && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {distance} km
              </span>
            )}
          </div>
          
          {/* Rating */}
          {rating && (
            <div className="flex items-center">
              <FaStar className="mr-1 text-yellow-500" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
              >
                <FaTag className="mr-1 text-xs text-indigo-600" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-block text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Host Information (only for onlyforyou variant) */}
        {variant === 'onlyforyou' && getPerson() && Object.keys(getPerson()).length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center">
            <img 
              src={getPerson().image} 
              alt={getPerson().name} 
              className="w-8 h-8 rounded-full object-cover mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/32?text=Host'; // Fallback image
              }}
            />
            <div>
              <p className="text-sm font-medium">{getPerson().name}</p>
              <p className="text-xs text-gray-500">{getPersonTitle()} {getPerson().verified && '✓'}</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons: For explore variant, only show centered View Details button; for others, show both */}
        {variant === 'explore' ? (
          <div className="mt-4 flex justify-center">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-2 rounded transition-colors duration-200 mt-1 text-sm"
              onClick={onCardClick}
              aria-label="View details"
            >
              View Details
            </button>
          </div>
        ) : (customActions || (
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={onPrimaryAction}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {getPrimaryActionText()}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCardClick();
              }}
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes for type checking
EventCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    location: PropTypes.string,
    distance: PropTypes.number,
    rating: PropTypes.number,
    participants: PropTypes.number,
    maxParticipants: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    event_image: PropTypes.string, // Add event_image field
    host: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      image: PropTypes.string,
      verified: PropTypes.bool
    }),
    date: PropTypes.string,
    time: PropTypes.string,
    recommendation: PropTypes.shape({
      score: PropTypes.number
    }),
    memberCount: PropTypes.number,
    attendees: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array
    ]),
    activity: PropTypes.string
  }).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  source: PropTypes.string,
  type: PropTypes.oneOf(['event', 'table', 'circle']),
  showDescription: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'explore', 'onlyforyou']),
  customActions: PropTypes.node,
  disableNavigation: PropTypes.bool,
  hideHeader: PropTypes.bool
};

export default EventCard;
