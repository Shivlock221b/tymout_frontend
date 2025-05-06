import React from 'react';

// Generic skeleton loader component following the Single Responsibility Principle
// Can be customized with different patterns based on the route/content type
const SkeletonLoader = ({ type = 'default' }) => {
  // Common skeleton pulse animation class
  const pulseClass = "animate-pulse bg-gray-200 rounded";
  
  // Different skeleton patterns based on content type
  const renderSkeletonPattern = () => {
    switch(type) {
      case 'profile':
        return (
          <div className="w-full max-w-3xl mx-auto">
            {/* Header with avatar and name */}
            <div className="flex items-center mb-8">
              <div className={`${pulseClass} h-16 w-16 rounded-full mr-4`}></div>
              <div className="flex-1">
                <div className={`${pulseClass} h-6 w-48 mb-2`}></div>
                <div className={`${pulseClass} h-4 w-32`}></div>
              </div>
            </div>
            
            {/* Content blocks */}
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className={`${pulseClass} h-5 w-32`}></div>
                  <div className={`${pulseClass} h-24 w-full`}></div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'feed':
        return (
          <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Multiple post items */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className={`${pulseClass} h-10 w-10 rounded-full mr-3`}></div>
                  <div>
                    <div className={`${pulseClass} h-4 w-32 mb-2`}></div>
                    <div className={`${pulseClass} h-3 w-24`}></div>
                  </div>
                </div>
                <div className={`${pulseClass} h-24 w-full mb-4`}></div>
                <div className="flex space-x-4">
                  <div className={`${pulseClass} h-8 w-20`}></div>
                  <div className={`${pulseClass} h-8 w-20`}></div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'chat':
        return (
          <div className="w-full max-w-3xl mx-auto">
            {/* Chat header */}
            <div className="flex items-center p-4 border-b">
              <div className={`${pulseClass} h-10 w-10 rounded-full mr-3`}></div>
              <div className={`${pulseClass} h-5 w-40`}></div>
            </div>
            
            {/* Chat messages */}
            <div className="p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`${pulseClass} h-10 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-lg`}></div>
                </div>
              ))}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t">
              <div className={`${pulseClass} h-12 w-full rounded-full`}></div>
            </div>
          </div>
        );
      
      // Default skeleton for general pages
      default:
        return (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header section */}
            <div className={`${pulseClass} h-8 w-64 mb-8`}></div>
            
            {/* Main content blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className={`${pulseClass} h-40 w-full rounded-lg`}></div>
                  <div className={`${pulseClass} h-5 w-3/4`}></div>
                  <div className={`${pulseClass} h-4 w-1/2`}></div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {renderSkeletonPattern()}
    </div>
  );
};

export default SkeletonLoader;
