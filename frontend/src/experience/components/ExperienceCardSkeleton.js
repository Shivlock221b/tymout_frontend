import React from 'react';

/**
 * ExperienceCardSkeleton component
 * Shows loading animation while experience data is being fetched
 * Uses Tailwind CSS for skeleton animation
 * Matches the new card design with left-aligned title, rating, location, price for two, and tags
 */
const ExperienceCardSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow-md mb-6 overflow-hidden animate-pulse">
      {/* Large image skeleton */}
      <div className="w-full aspect-video bg-gray-200"></div>
      
      {/* Content container */}
      <div className="p-4">
        {/* Title skeleton - left aligned */}
        <div className="h-6 bg-gray-200 rounded w-3/5 mb-3"></div>
        
        {/* Rating tag skeleton */}
        <div className="flex items-center mb-2">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Location skeleton */}
        <div className="flex items-center mb-2">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
        
        {/* Price for two skeleton */}
        <div className="flex items-center mb-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Tags skeleton */}
        <div className="flex flex-wrap mt-2">
          <div className="h-6 bg-gray-200 rounded-full w-16 mr-1"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14 mr-1"></div>
          <div className="h-6 bg-gray-200 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCardSkeleton;
