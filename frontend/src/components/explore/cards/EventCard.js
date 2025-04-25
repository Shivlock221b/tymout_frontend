import React from 'react';
import PropTypes from 'prop-types';
import UniversalEventCard from '../../common/EventCard';

/**
 * EventCard component for Explore section
 * 
 * This is a wrapper component that uses the universal EventCard component
 * with specific configuration for the Explore section.
 * 
 * Following SOLID principles - Single Responsibility and Dependency Inversion Principle
 */
const EventCard = ({ item }) => {
  // Just pass through to the universal component with specific defaults
  return (
    <UniversalEventCard
      item={item}
      source="explore"
      type="event"
      variant="explore"
    />
  );
};

// PropTypes for type checking
EventCard.propTypes = {
  item: PropTypes.object.isRequired
};

export default EventCard;
