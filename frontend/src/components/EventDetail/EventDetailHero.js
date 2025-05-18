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

  return (
    <div className="relative h-72 md:h-96 w-full">
      <img
        src={item.image || item.event_image} // Use event_image if image is not available
        alt={item.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/1200x600?text=No+Image';
        }}
      />
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
