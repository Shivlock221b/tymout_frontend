import React from 'react';

/**
 * Skeleton loading component for the Explore page
 * Provides immediate visual feedback while data is loading
 */
const ExploreSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Skeleton for search and filters */}
      <div className="mb-6">
        <div className="h-10 bg-gray-200 rounded-lg w-full mb-4"></div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded-full w-24 flex-shrink-0"></div>
          ))}
        </div>
      </div>
      
      {/* Skeleton for spotlight events */}
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-300"></div>
              <div className="p-4 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Skeleton for event results */}
      <div>
        <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center mt-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreSkeleton;
