import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

/**
 * FeedbackButton Component
 * 
 * Single Responsibility: Display a button that allows users to provide feedback for a shop
 * This component handles:
 * 1. Rendering a star icon with rating display
 * 2. Handling click events for the feedback action (to be implemented later)
 */
const FeedbackButton = ({ shopId, rating = 4.0, reviewCount = 0 }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Make sure shopId is defined before navigating
    if (shopId) {
      navigate(`/shop/${shopId}/feedback`);
    } else {
      console.error('Shop ID is undefined');
    }
  };
  // Format the rating to display with one decimal place
  const formattedRating = parseFloat(rating).toFixed(1);
  
  // Format the review count (e.g., 6.8K+)
  const formatReviewCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    }
    return `${count}+`;
  };
  
  return (
    <button 
      onClick={handleClick} 
      className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 hover:bg-green-200 transition-colors"
      aria-label="View shop feedback"
    >
      <FaStar className="text-green-600 mr-1" />
      <span className="font-bold">{formattedRating}</span>
      <span className="text-xs ml-2 text-gray-600">
        By {formatReviewCount(reviewCount)}
      </span>
    </button>
  );
};

export default FeedbackButton;
