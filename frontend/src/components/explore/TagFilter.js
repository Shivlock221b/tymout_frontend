import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * TagFilter Component
 * 
 * Following Single Responsibility Principle:
 * - This component handles only tag filtering functionality
 * - It provides a visually appealing UI with rounded borders
 * - Allows selection of multiple tags for filtering content
 */
const TagFilter = ({ onTagSelect, selectedTags = [], onSpecialTagSelect, activeSpecialTag = null, hideRegularTags = false }) => {
  // Get authentication status from auth store
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  
  // Popular tags used for filtering - all possible tags for backend logic
  // Many are hidden from UI but kept for backend functionality
  /* eslint-disable no-unused-vars */
  const availableTags = [
    'Only For You', 'Food', 'Play', 'Art', 'Learn', 'Serve', 
    'Socialize', 'Travel', 'Culture', 'Wellness'
  ];
  /* eslint-enable no-unused-vars */
  
  // Tags with emojis that should be visible in the UI
  // Excluding 'Only For You', 'Learn', 'Art', 'Serve', and 'Culture' as requested
  const tagEmojis = {
    'Food': '🍽️',
    'Play': '👟', // Changed to shoes emoji
    'Socialize': '🎉', // Changed to party emoji
    'Travel': '✈️',
    'Wellness': '🧘'
  };
  
  // Color schemes for each tag when selected
  const tagColors = {
    'Food': {
      bg: 'bg-orange-100',
      border: 'border-orange-400',
      text: 'text-orange-700'
    },
    'Play': {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-700'
    },
    'Socialize': {
      bg: 'bg-pink-100',
      border: 'border-pink-400',
      text: 'text-pink-700'
    },
    'Travel': {
      bg: 'bg-green-100',
      border: 'border-green-400',
      text: 'text-green-700'
    },
    'Wellness': {
      bg: 'bg-purple-100',
      border: 'border-purple-400',
      text: 'text-purple-700'
    }
  };
  
  // Only show tags that have emojis assigned (our visible tags)
  const visibleTags = Object.keys(tagEmojis);

  // Handle single tag selection/deselection (single-select)
  const handleTagClick = (tag) => {
    if (selectedTags[0] === tag) {
      // Deselect if already selected
      onTagSelect([]);
    } else {
      // Only one tag can be selected at a time
      onTagSelect([tag]);
    }
  };

  // Simplified function for handling special tags like 'Only For You'
  // This is kept for the hidden functionality but not directly exposed in UI
  // NOTE: This function is intentionally preserved but currently unused.
  // It will be called programmatically from ExplorePage.js when needed
  // through the onSpecialTagSelect prop to maintain the 'Only For You' functionality
  /* eslint-disable no-unused-vars */
  const handleSpecialTag = (tag) => {
    // Keep this function to maintain special tag functionality
    // even though the UI elements are hidden
    if (tag === 'Only For You') {
      if (!isAuthenticated) {
        setShowLoginTooltip(true);
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              from: location,
              message: 'Please log in to see personalized recommendations' 
            } 
          });
        }, 800);
        return;
      }
      
      // Pass the special tag to parent component for processing
      onSpecialTagSelect('Only For You');
    }
  };

  return (
    <>
      <style>{`
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
      {/* Only show regular tag filter section if not hiding regular tags */}
      {!hideRegularTags && (
        <div className="tag-scroll-container">
          
          {/* Only display visible tags (excludes 'Only For You') */}
          {visibleTags.map(tag => (
            <div key={tag} className="relative">
              <button
                onClick={() => handleTagClick(tag)}
                className={`
                  tag-item px-5 py-3 text-lg transition-all duration-200 flex items-center justify-center
                  ${selectedTags.includes(tag)
                    ? `${tagColors[tag].bg} ${tagColors[tag].text} border-b-2 ${tagColors[tag].border} rounded-t-lg` 
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:rounded-t-lg'}
                `}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-xl mr-1">{tagEmojis[tag]}</span>
                  <span className="font-bold text-gray-800">{tag}</span>
                </div>
              </button>
            </div>
          ))}
          
          {/* Keep 'Only For You' functionality but hide the button */}
          {/* This is a hidden element that maintains the functionality */}
          <div className="hidden">
            {showLoginTooltip && !isAuthenticated && (
              <div className="absolute -top-12 left-0 right-0 mx-auto w-48 bg-indigo-600 text-white text-xs rounded py-1 px-2 z-50 text-center">
                Login required for personalized content
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-indigo-600"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

TagFilter.propTypes = {
  onTagSelect: PropTypes.func.isRequired,
  selectedTags: PropTypes.array,
  onSpecialTagSelect: PropTypes.func.isRequired,
  activeSpecialTag: PropTypes.string,
  hideRegularTags: PropTypes.bool
};

export default TagFilter;
