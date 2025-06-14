import React from 'react';
import PropTypes from 'prop-types';

/**
 * EventDetailHero Component
 * 
 * Following the Single Responsibility Principle:
 * This component handles only the hero image and title section
 */
const EventDetailHero = ({ item, type }) => {
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
  
  // Get host initials for fallback avatar
  const getHostInitials = () => {
    const host = item.host;
    if (!host || !host.name) return '?';
    
    const nameParts = host.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0][0].toUpperCase();
    } else {
      return '?';
    }
  };

  return (
    <div className="relative h-72 md:h-96 w-full">
      {(item.image || item.event_image) ? (
        <img
          src={item.image || item.event_image} // Use event_image if image is not available
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            // Create and show a fallback avatar with host initials
            const container = e.target.parentNode;
            e.target.style.display = 'none';
            
            // Create avatar with host initials
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'w-full h-full flex items-center justify-center bg-indigo-100';
            
            const initialsSpan = document.createElement('span');
            initialsSpan.className = 'text-indigo-500 font-bold text-6xl';
            initialsSpan.textContent = getHostInitials();
            
            avatarDiv.appendChild(initialsSpan);
            container.appendChild(avatarDiv);
          }}
        />
      ) : (
        // If no image is available, show host initials avatar
        <div className="w-full h-full flex items-center justify-center bg-indigo-100">
          <span className="text-indigo-500 font-bold text-6xl">{getHostInitials()}</span>
        </div>
      )}
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">
          Image source: {item.image ? 'image' : (item.event_image ? 'event_image' : 'none')}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      {/* Category Badge */}
      {item.category && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {item.category}
        </div>
      )}
      
      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {getTypeLabel()}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{item.title}</h1>
      </div>
    </div>
  );
};

EventDetailHero.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired
};

export default EventDetailHero;
