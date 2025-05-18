import React from 'react';
import PropTypes from 'prop-types';

/**
 * ExploreFilters Component - Empty placeholder
 * 
 * Following Single Responsibility Principle:
 * - This component has been stripped of filtering functionality as requested
 * - Component structure maintained for interface consistency (SOLID principles)
 */
const ExploreFilters = ({ filters, onFilterChange, activeTab }) => {
  // Component intentionally returns null as functionality has been removed
  return null;
};

// PropTypes maintained for interface consistency
ExploreFilters.propTypes = {
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  activeTab: PropTypes.string
};

export default ExploreFilters;
