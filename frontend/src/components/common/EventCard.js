import React from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaTag, FaClock, FaCalendarAlt, FaUsers, FaStar } from 'react-icons/fa';
import useEventCard from '../../hooks/useEventCard';

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
  disableNavigation = false
}) => {
  // Using our custom hook instead of direct navigation and state management
  const { 
    handleCardClick, 
    handleProfileClick, 
    handlePrimaryAction,
    isPending
  } = useEventCard(source);
  
  // Handle null/undefined checks for properties
  if (!item) return null;
  
  const {
    id,
    title,
    description,
    location,
    distance,
    participants,
    maxParticipants,
    tags,
    image,
    event_image, // Add event_image field
    host,
    date,
    time,
    recommendation,
    memberCount,
    attendees,
    rating,
    activity,
    place // Extract place data from item
  } = item;
  
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

  // Horizontal layout for explore variant
  if (variant === 'explore') {
    return (
      <div 
        id={cardElementId}
        className="w-full bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
        onClick={onCardClick}
      >
        {/* Host/Admin Information - At the very top (explore variant) */}
        {getPerson() && Object.keys(getPerson()).length > 0 && (
          <div 
            className="py-2 px-4 bg-gray-50 flex items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={onProfileClick}
          >
            <img 
              src={getPerson().image} 
              alt={getPerson().name} 
              className="w-8 h-8 rounded-full object-cover mr-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/32?text=User'; // Fallback image
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{getPerson().name}</p>
              <p className="text-xs text-gray-500">{getPersonTitle()} {getPerson().verified && '✓'}</p>
            </div>
            {/* More options (three dots) */}
            <div className="text-gray-400 hover:text-gray-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Main Card Content - Horizontal Layout */}
        <div className="flex p-3">
          {/* Left: Card Image */}
          <div className="w-1/3 relative">
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  alt={(type || "Item") + " Image"}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-indigo-100');
                    const textElement = document.createElement('div');
                    textElement.className = 'flex items-center justify-center h-full w-full text-indigo-500 font-medium';
                    textElement.innerText = type.charAt(0).toUpperCase() + type.slice(1);
                    e.target.parentNode.appendChild(textElement);
                  }}
                />
                {/* Discount/Deal Overlay */}
                {recommendation && (
                  <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-black bg-opacity-70 text-white font-bold text-lg">
                    {Math.round(recommendation.score * 100)}% OFF
                  </div>
                )}
                {/* No heart icon */}
              </>
            ) : (
              // If no image is provided, show a colored background with text
              <div className="bg-indigo-100 w-full h-full flex items-center justify-center">
                <span className="text-indigo-500 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            )}
            {activity && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                <span className="font-medium">{activity}</span>
              </div>
            )}
          </div>
          
          {/* Right: Content Section */}
          <div className="w-2/3 pl-4 flex flex-col">
            {/* Title */}
            <h3 className="text-base font-semibold mb-1 line-clamp-2">{title}</h3>
            
            {/* Rating */}
            {rating && (
              <div className="flex items-center mb-2">
                <div className="flex items-center text-green-600 bg-green-100 rounded-full px-2 py-0.5">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-xs font-medium">{rating}</span>
                  <span className="mx-1 text-xs">•</span>
                  <span className="text-xs">25-30 mins</span>
                </div>
              </div>
            )}
            
            {/* Categories/Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 2).map((tag, index) => {
                  // Array of tag color combinations
                  const tagColors = [
                    { bg: 'bg-blue-100', text: 'text-blue-700' },
                    { bg: 'bg-green-100', text: 'text-green-700' },
                    { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                    { bg: 'bg-purple-100', text: 'text-purple-700' },
                    { bg: 'bg-pink-100', text: 'text-pink-700' },
                    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
                  ];
                  
                  // Select a color based on the tag string to ensure consistency
                  const colorIndex = tag.length % tagColors.length;
                  const { bg, text } = tagColors[colorIndex];
                  
                  return (
                    <span
                      key={`tag-${index}`}
                      className={`${bg} ${text} text-xs px-2 py-0.5 rounded-full`}
                    >
                      {tag}
                    </span>
                  );
                })}
                {tags.length > 2 && (
                  <span className="text-gray-500 text-xs">+{tags.length - 2} more</span>
                )}
              </div>
            )}
            
            {/* Location */}
            <div className="flex items-center mb-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {place?.name ? place.name : location}
                {distance && (
                  <span className="ml-1 text-gray-500">• {distance} km</span>
                )}
              </span>
            </div>
            
            {/* Date and Time - Only show if available */}
            {(date || time) && (
              <div className="flex flex-wrap gap-3 mb-2">
                {date && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-600">{date}</span>
                  </div>
                )}
                {time && (
                  <div className="flex items-center">
                    <FaClock className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-600">{time}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Participants/Attendees - Only show if available */}
            {getParticipantCount() > 0 && (
              <div className="flex items-center text-gray-600 text-xs">
                <FaUsers className="h-3 w-3 mr-1" />
                <span>{getParticipantCount()}{maxParticipants ? `/${maxParticipants}` : ''} participants</span>
              </div>
            )}
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
      {(variant === 'default' || variant === 'explore') && getPerson() && Object.keys(getPerson()).length > 0 && (
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
  disableNavigation: PropTypes.bool
};

export default EventCard;
