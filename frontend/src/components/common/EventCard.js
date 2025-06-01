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
  // After refactoring, the event image should be the host's profile image
  const displayImage = image || event_image;
  
  // Get host initials for fallback avatar
  const getHostInitials = () => {
    const person = getPerson();
    if (!person || !person.name) return '?';
    
    const nameParts = person.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0][0].toUpperCase();
    } else {
      return '?';
    }
  };

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
        className="w-full bg-white overflow-hidden hover:bg-gray-50 transition-all duration-300 cursor-pointer mb-2"
        onClick={onCardClick}
      >
        {/* Removed separate host section from the top */}
        
        {/* Main Card Content - WhatsApp Chat-like Layout */}
        <div className="flex p-4">
          {/* Left: Event Image (as profile picture) */}
          <div className="flex-shrink-0">
            {displayImage ? (
              <div className="relative">
                <img
                  src={displayImage}
                  alt={(type || "Item") + " Image"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-indigo-100', 'rounded-full', 'w-14', 'h-14', 'flex', 'items-center', 'justify-center');
                    const textElement = document.createElement('div');
                    textElement.className = 'text-indigo-500 font-medium text-lg';
                    textElement.innerText = title?.charAt(0) || type.charAt(0).toUpperCase();
                    e.target.parentNode.appendChild(textElement);
                  }}
                />
                {activity && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    <span className="font-medium text-xs">{activity}</span>
                  </div>
                )}
              </div>
            ) : (
              // If no image is provided, show host initials in a circle
              <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center border-2 border-gray-200">
                <span className="text-indigo-500 font-medium text-lg">{getHostInitials()}</span>
              </div>
            )}
          </div>
          
          {/* Right: Content Section (like a chat bubble) */}
          <div className="ml-4 flex-1 flex flex-col">
            {/* Title Row */}
            <div className="flex justify-between items-start mb-1">
              {/* Title (like contact name) */}
              <h3 className="text-base font-bold line-clamp-1">{title}</h3>
            </div>
            
            {/* Description (like message preview) */}
            {description && showDescription && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{getShortDescription(description)}</p>
            )}
            
            {/* Hosted By section removed from here and moved to location line */}
            
            {/* Rating - WhatsApp style with green checkmarks */}
            {rating && (
              <div className="flex items-center mb-1.5">
                <div className="flex items-center">
                  <FaStar className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-700">{rating}</span>
                  <span className="mx-1 text-xs text-gray-400">•</span>
                </div>
              </div>
            )}
            
            {/* Info row with time, location, participants */}
            <div className="flex flex-wrap items-center gap-2 mt-auto">
              {/* Time */}
              {time && (
                <div className="flex items-center text-xs text-gray-500">
                  <FaClock className="h-3 w-3 mr-1" />
                  <span>{time}</span>
                </div>
              )}
              
              {/* Host and Date Info */}
              <div className="flex w-full justify-between items-center">
                {/* Date left-aligned */}
                {date && (
                  <div className="flex items-center text-xs text-gray-500">
                    <FaCalendarAlt className="h-3 w-3 mr-1" />
                    <span>{date}</span>
                  </div>
                )}
                
                {/* Hosted By section - right aligned */}
                {getPerson() && Object.keys(getPerson()).length > 0 && (
                  <div className="flex items-center text-xs text-gray-500 ml-auto cursor-pointer" onClick={onProfileClick}>
                    <span className="text-xs text-gray-600 mr-1">Host:</span>
                    <img 
                      src={getPerson().image} 
                      alt={getPerson().name} 
                      className="w-4 h-4 rounded-full object-cover mx-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/16?text=U';
                      }}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {getPerson().name} {getPerson().verified && '✓'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Participants/Attendees with blue ticks like WhatsApp read receipts */}
              {getParticipantCount() > 0 && (
                <div className="flex items-center text-xs text-gray-500 ml-auto">
                  <FaUsers className="h-3 w-3 mr-1 text-blue-500" />
                  <span className="text-blue-500">{getParticipantCount()}{maxParticipants ? `/${maxParticipants}` : ''}</span>
                </div>
              )}
            </div>
            
            {/* Tags and Location - tags on left, location on right */}
            <div className="flex justify-between items-center mt-2">
              {/* Tags as chat labels */}
              <div className="flex flex-wrap gap-1 items-center">
                {tags && tags.length > 0 && tags.slice(0, 2).map((tag, index) => {
                  // More subtle colors for WhatsApp style
                  const tagColors = [
                    { bg: 'bg-blue-50', text: 'text-blue-600' },
                    { bg: 'bg-green-50', text: 'text-green-600' },
                    { bg: 'bg-yellow-50', text: 'text-yellow-600' },
                    { bg: 'bg-purple-50', text: 'text-purple-600' },
                    { bg: 'bg-pink-50', text: 'text-pink-600' },
                    { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                  ];
                  
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
                
                {/* Inline +X indicator */}
                {tags && tags.length > 2 && (
                  <span className="text-gray-400 text-xs ml-1">+{tags.length - 2}</span>
                )}
              </div>
              
              {/* Location info - right aligned */}
              {(location || place?.name) && (
                <div className="flex items-center text-xs text-gray-500 ml-auto">
                  <FaMapMarkerAlt className="h-3 w-3 text-gray-500 mr-1" />
                  <span>
                    {place?.name ? place.name : location}
                    {distance && (
                      <span className="ml-1">• {distance} km</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            {/* +X more tags indicator is now inline with the tags */}
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
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={title || type}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                // Show host initials avatar instead of placeholder
                const container = e.target.parentNode;
                e.target.style.display = 'none';
                
                // Create avatar with host initials
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'w-full h-full flex items-center justify-center bg-indigo-100';
                
                const initialsSpan = document.createElement('span');
                initialsSpan.className = 'text-indigo-500 font-bold text-5xl';
                initialsSpan.textContent = getHostInitials();
                
                avatarDiv.appendChild(initialsSpan);
                container.appendChild(avatarDiv);
              }}
            />
          ) : (
            // If no image is available, show host initials avatar
            <div className="w-full h-full flex items-center justify-center bg-indigo-100">
              <span className="text-indigo-500 font-bold text-5xl">{getHostInitials()}</span>
            </div>
          )}
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
