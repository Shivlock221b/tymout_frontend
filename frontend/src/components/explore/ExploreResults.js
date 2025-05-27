import React from 'react';
import EventCard from '../common/EventCard';

/**
 * ExploreResults Component
 * 
 * Following Single Responsibility Principle:
 * - This component only handles displaying the results list
 * - It uses the type property of each item to determine how to display it
 */
const ExploreResults = ({ results, isLoading, isRefetching = false, emptyMessage = "No results found. Try adjusting your search or filters." }) => {
  // Render minimalistic loading skeleton without animation
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-gray-50 h-48 rounded-lg"></div>
      ))}
    </div>
  );
  
  // Only show skeleton on initial load, not when refreshing with existing data
  if (isLoading && (!results || results.length === 0)) {
    return renderSkeleton();
  }
  
  // Handle empty results
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No results found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  // Show a subtle loading indicator during background refreshes
  const RefreshIndicator = () => isRefetching ? (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="bg-indigo-500 h-full w-1/3 animate-pulse"></div>
    </div>
  ) : null;
  
  // Render results - now using list format for mobile and grid for desktop
  return (
    <>
      <RefreshIndicator />
      <div className="flex flex-col space-y-2 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-10 sm:space-y-0">
        {results.map((item, index) => {
          // Make sure the item is valid
          if (!item || !item.id) {
            console.warn('Invalid item in results', item);
            return null;
          }
          
          // For the list view (mobile), add dividers between items (except the last one)
          const isLastItem = index === results.length - 1;
          
          return (
            <div key={item.id} className="flex flex-col">
              <EventCard 
                item={item} 
                type={item.type || 'event'} // Default to 'event' if type is missing
                source="explore"
                fullWidth={true} // Add fullWidth prop to make cards fill their grid cells
                variant="explore"
              />
              {!isLastItem && (
                <div className="sm:hidden mx-auto w-4/5 my-2">
                  <div className="h-px bg-gray-200"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ExploreResults;
