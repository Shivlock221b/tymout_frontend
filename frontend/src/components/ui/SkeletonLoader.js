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

      case 'mainProfile':
        return (
          <div className="w-full max-w-7xl mx-auto">
            {/* Main profile header with large avatar */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-6 py-6">
                {/* Avatar and profile header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
                  <div className={`${pulseClass} h-24 w-24 rounded-full mb-4 sm:mb-0 sm:mr-6`}></div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className={`${pulseClass} h-7 w-64 mb-3 mx-auto sm:mx-0`}></div>
                    <div className={`${pulseClass} h-4 w-48 mb-2 mx-auto sm:mx-0`}></div>
                    <div className={`${pulseClass} h-4 w-32 mx-auto sm:mx-0`}></div>
                  </div>
                </div>
                
                {/* Completeness bar */}
                <div className="mb-8">
                  <div className={`${pulseClass} h-5 w-40 mb-2`}></div>
                  <div className={`${pulseClass} h-3 w-full mb-1`}></div>
                  <div className="flex justify-between">
                    <div className={`${pulseClass} h-3 w-12`}></div>
                    <div className={`${pulseClass} h-3 w-12`}></div>
                  </div>
                </div>
                
                {/* User details */}
                <div className="mb-8">
                  <div className={`${pulseClass} h-6 w-32 mb-4`}></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${pulseClass} h-12 w-full`}></div>
                    <div className={`${pulseClass} h-12 w-full`}></div>
                    <div className={`${pulseClass} h-12 w-full`}></div>
                    <div className={`${pulseClass} h-12 w-full`}></div>
                  </div>
                </div>
                
                {/* Verification badges */}
                <div className="mb-8">
                  <div className={`${pulseClass} h-6 w-48 mb-4`}></div>
                  <div className="flex space-x-3">
                    <div className={`${pulseClass} h-10 w-10 rounded-full`}></div>
                    <div className={`${pulseClass} h-10 w-10 rounded-full`}></div>
                    <div className={`${pulseClass} h-10 w-10 rounded-full`}></div>
                  </div>
                </div>
                
                {/* Interests */}
                <div className="mb-8">
                  <div className={`${pulseClass} h-6 w-32 mb-4`}></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`${pulseClass} h-8 w-20 rounded-full`}></div>
                    ))}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-center space-x-4">
                    <div className={`${pulseClass} h-10 w-32 rounded-md`}></div>
                    <div className={`${pulseClass} h-10 w-32 rounded-md`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'userProfile':
        return (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* User Profile Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  {/* Profile Image */}
                  <div className="md:mr-8 mb-4 md:mb-0 flex-shrink-0">
                    <div className="relative">
                      <div className={`${pulseClass} w-32 h-32 rounded-full`}></div>
                      <div className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full">
                        <div className={`${pulseClass} h-4 w-4 rounded-full`}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className={`${pulseClass} h-8 w-48 mb-2 md:mb-0`}></div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className={`${pulseClass} h-4 w-4 mr-1 rounded-full`}></div>
                          <div className={`${pulseClass} h-4 w-12`}></div>
                        </div>
                        
                        <div className={`${pulseClass} h-4 w-32`}></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className={`${pulseClass} h-4 w-4 mr-2 rounded-full`}></div>
                      <div className={`${pulseClass} h-4 w-40`}></div>
                    </div>
                    
                    <div className={`${pulseClass} h-16 w-full mb-4`}></div>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`${pulseClass} h-8 w-16 rounded-full`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className={`${pulseClass} h-6 w-32 mx-6 my-6`}></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pt-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className={`${pulseClass} h-12 w-12 mx-auto mb-2 rounded-full`}></div>
                    <div className={`${pulseClass} h-5 w-20 mx-auto mb-1`}></div>
                    <div className={`${pulseClass} h-4 w-16 mx-auto`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'explorePage':
        return (
          <div className="w-full max-w-7xl mx-auto">
            {/* Search and filter bar */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div className={`${pulseClass} h-8 w-64 mb-4 md:mb-0`}></div>
                <div className="flex space-x-3">
                  <div className={`${pulseClass} h-10 w-24 rounded-md`}></div>
                  <div className={`${pulseClass} h-10 w-24 rounded-md`}></div>
                </div>
              </div>
              
              {/* Search bar */}
              <div className={`${pulseClass} h-12 w-full rounded-full mb-6`}></div>
              
              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`${pulseClass} h-8 w-20 rounded-full`}></div>
                ))}
              </div>
            </div>
            
            {/* Events grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Event image */}
                  <div className={`${pulseClass} h-48 w-full`}></div>
                  
                  {/* Event content */}
                  <div className="p-4">
                    <div className={`${pulseClass} h-6 w-3/4 mb-2`}></div>
                    
                    {/* Event details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center">
                        <div className={`${pulseClass} h-4 w-4 rounded-full mr-2`}></div>
                        <div className={`${pulseClass} h-4 w-32`}></div>
                      </div>
                      <div className="flex items-center">
                        <div className={`${pulseClass} h-4 w-4 rounded-full mr-2`}></div>
                        <div className={`${pulseClass} h-4 w-40`}></div>
                      </div>
                      <div className="flex items-center">
                        <div className={`${pulseClass} h-4 w-4 rounded-full mr-2`}></div>
                        <div className={`${pulseClass} h-4 w-24`}></div>
                      </div>
                    </div>
                    
                    {/* Event footer */}
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className={`${pulseClass} h-8 w-8 rounded-full border-2 border-white`}></div>
                        ))}
                      </div>
                      <div className={`${pulseClass} h-8 w-20 rounded-md`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`${pulseClass} h-10 w-10 rounded-md`}></div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'myEventsPage':
        return (
          <div className="w-full max-w-7xl mx-auto">
            {/* Page header with tabs */}
            <div className="mb-8">
              <div className={`${pulseClass} h-8 w-48 mb-6`}></div>
              
              {/* Tabs */}
              <div className="flex border-b mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`${pulseClass} h-10 ${i === 0 ? 'w-32 border-b-2 border-indigo-600' : 'w-28'} mr-6`}></div>
                ))}
              </div>
            </div>
            
            {/* Event list with status indicators */}
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Event image */}
                    <div className={`${pulseClass} h-48 md:h-auto md:w-1/3 lg:w-1/4`}></div>
                    
                    {/* Event details */}
                    <div className="p-4 flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <div className={`${pulseClass} h-6 w-48 mb-2`}></div>
                          <div className={`${pulseClass} h-4 w-32 mb-4`}></div>
                        </div>
                        
                        {/* Status badge */}
                        <div className={`${pulseClass} h-8 w-24 rounded-full mt-2 md:mt-0`}></div>
                      </div>
                      
                      {/* Event info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center">
                          <div className={`${pulseClass} h-4 w-4 rounded-full mr-2`}></div>
                          <div className={`${pulseClass} h-4 w-full max-w-sm`}></div>
                        </div>
                        <div className="flex items-center">
                          <div className={`${pulseClass} h-4 w-4 rounded-full mr-2`}></div>
                          <div className={`${pulseClass} h-4 w-32`}></div>
                        </div>
                        <div className="flex items-center">
                          <div className={`${pulseClass} h-4 w-4 rounded-full mr-2`}></div>
                          <div className={`${pulseClass} h-4 w-40`}></div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <div className={`${pulseClass} h-10 w-28 rounded-md`}></div>
                        <div className={`${pulseClass} h-10 w-28 rounded-md`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state for when list is empty */}
            <div className="hidden">
              <div className="flex flex-col items-center justify-center py-16">
                <div className={`${pulseClass} h-24 w-24 rounded-full mb-6`}></div>
                <div className={`${pulseClass} h-8 w-64 mb-4 mx-auto`}></div>
                <div className={`${pulseClass} h-4 w-96 mb-6 mx-auto`}></div>
                <div className={`${pulseClass} h-12 w-48 rounded-md mx-auto`}></div>
              </div>
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
