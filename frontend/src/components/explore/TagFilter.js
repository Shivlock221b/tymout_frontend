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
  
  // Popular tags used for filtering
  const availableTags = [
    'All', 'Only For You', 'Food', 'Play', 'Create', 'Learn', 'Serve', 
    'Socialize', 'Networking', 'Games', 'Adventure', 'Culture', 'Wellness'
  ];

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

  // Special navigation/filter options
  const handleSpecialTagClick = (tag) => {
    // For 'Only For You', check if user is authenticated
    if (tag === 'Only For You' && !isAuthenticated) {
      // Redirect to login page with message
      navigate('/login', { 
        state: { 
          from: location,
          message: 'Please log in to see personalized recommendations' 
        } 
      });
      return;
    }
    
    // Pass the clicked special tag to parent component
    onSpecialTagSelect(tag);
  };
  
  // Handle click on 'Only For You' when not authenticated
  const handleOnlyForYouClick = () => {
    if (!isAuthenticated) {
      // Show tooltip briefly before redirecting
      setShowLoginTooltip(true);
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: location,
            message: 'Please log in to see personalized recommendations' 
          } 
        });
      }, 800);
    }
  };

  return (
    <>
      {/* Only show regular tag filter section if not hiding regular tags */}
      {!hideRegularTags && (
        <div className="flex items-center w-full">
          
          {/* Available tags */}
          {availableTags.map(tag => (
            <div key={tag} className="relative flex-1">
              {tag === 'Only For You' && showLoginTooltip && !isAuthenticated && (
                <div className="absolute -top-12 left-0 right-0 mx-auto w-48 bg-indigo-600 text-white text-xs rounded py-1 px-2 z-50 text-center">
                  Login required for personalized content
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-indigo-600"></div>
                </div>
              )}
              <button
                onClick={() => {
                  if (tag === 'Only For You' && !isAuthenticated) {
                    handleOnlyForYouClick();
                  } else if (tag === 'Only For You' || tag === 'All') {
                    handleSpecialTagClick(tag);
                  } else {
                    handleTagClick(tag);
                  }
                }}
                className={`
                  tag-item w-full px-5 py-3 text-lg font-medium transition-all duration-200 flex items-center justify-center border-none !ml-0 !mr-0
                  ${(selectedTags.includes(tag) || (tag === 'Only For You' && activeSpecialTag === 'Only For You') || (tag === 'All' && activeSpecialTag === 'All'))
                    ? 'bg-white/30 text-white border-b-2 border-white rounded-t-lg' 
                    : 'bg-transparent text-white hover:bg-white/20 hover:rounded-t-lg'}
                  ${tag === 'Only For You' && !isAuthenticated ? 'cursor-pointer text-white/80 hover:text-white' : ''}
                `}
              >
                {tag}
              </button>
            </div>
          ))}
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
