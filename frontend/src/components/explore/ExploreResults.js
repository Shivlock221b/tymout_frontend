import React from 'react';
import EventCard from '../common/EventCard';

/**
 * ExploreResults Component
 * 
 * Following Single Responsibility Principle:
 * - This component only handles displaying the results list
 * - It uses the type property of each item to determine how to display it
 */
const ExploreResults = ({ results, isLoading }) => {
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
      ))}
    </div>
  );
  
  // Handle loading state
  if (isLoading) {
    return renderSkeleton();
  }
  
  // Handle empty results
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No results found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }
  
  // Render results - now using grid for desktop and keeping responsive for mobile
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {results.map(item => {
        // Make sure the item is valid
        if (!item || !item.id) {
          console.warn('Invalid item in results', item);
          return null;
        }
        
        // Render unified EventCard using the item's type property
        return (
          <EventCard 
            key={item.id} 
            item={item} 
            type={item.type || 'event'} // Default to 'event' if type is missing
            source="explore"
            fullWidth={true} // Add fullWidth prop to make cards fill their grid cells
            variant="explore"
          />
        );
      })}
    </div>
  );
};

export default ExploreResults;
