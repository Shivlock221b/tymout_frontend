import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { useShopById } from '../stores/shopStore';

/**
 * FeedbackPage Component
 * 
 * Single Responsibility: Display and collect feedback for a shop
 * This component handles:
 * 1. Displaying existing reviews for a shop
 * 2. Allowing users to submit new reviews (to be implemented)
 */
const FeedbackPage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  
  // Use the shop ID directly from the URL params with the correct hook
  const { 
    data: shopData, 
    isLoading, 
    error 
  } = useShopById(shopId);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // We'll implement the reviews data fetching later
  
  

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Shop Feedback</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              
              <div className="h-24 bg-gray-200 rounded w-full mb-6"></div>
              
              <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Shop Feedback</h1>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <p className="text-red-700">
                {error ? `Error loading shop: ${error.message || 'Unable to load shop data'}` : 'Shop not found'}
              </p>
            </div>
            <button 
              onClick={handleBack}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header with back button and shop name */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="p-2"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-800 text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-grow">
            {isLoading ? 'Loading...' : shopData?.name || 'Shop Feedback'}
          </h1>
          <div className="w-8"></div> {/* Empty div for balance */}
        </div>
        
        {/* Rating Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-center">
            {/* Overall Rating */}
            <div className="flex flex-col items-center">
              <div className="bg-green-600 text-white rounded-full px-4 py-1 mb-2 flex items-center">
                <span className="text-lg font-bold mr-1">4.0</span>
                <FaStar className="text-sm" />
              </div>
              <div className="flex items-center text-gray-600 text-xs">
                <span>Overall rating (6.8K)</span>
                <FaInfoCircle className="ml-1 text-gray-400 text-xs" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-red-400" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" 
              placeholder="Search within reviews"
            />
          </div>
        </div>
        
        {/* Filter Options */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button className="flex items-center gap-1 px-2 py-0.5 border border-red-300 rounded-full text-red-500 text-xs">
            <span className="bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs">1</span>
            <span>Filters</span>
          </button>
          
          <button className="flex items-center gap-1 px-2 py-0.5 border border-gray-300 rounded-full text-xs">
            <span>High Rating</span>
            <span>▼</span>
          </button>
          
          <button className="px-2 py-0.5 border border-gray-300 rounded-full text-xs">
            Verified
          </button>
          
          <button className="px-2 py-0.5 border border-gray-300 rounded-full whitespace-nowrap text-xs">
            With Photos
          </button>
        </div>
        
        {/* Reviews will be added here later */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          <p>Reviews will be implemented in the next phase</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
