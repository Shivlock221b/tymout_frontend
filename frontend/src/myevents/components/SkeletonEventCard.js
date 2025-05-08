import React from 'react';

/**
 * Skeleton loading placeholder for event cards
 * Mimics the structure of MyEventTicketCard for a smooth transition
 */
const SkeletonEventCard = () => {
  return (
    <div className="py-4 animate-pulse">
      <div className="flex items-start gap-3">
        {/* Image skeleton */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
        
        {/* Content skeleton */}
        <div className="flex-1">
          {/* Title */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          
          {/* Date/time */}
          <div className="flex items-center gap-1 mb-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export default SkeletonEventCard;
