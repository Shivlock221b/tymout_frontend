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
  
  // Popular tags used for filtering with emojis and their colors
  const availableTags = [
    { name: 'Only For You', emoji: '✨', color: 'indigo' },
    { name: 'Food', emoji: '🍽️', color: 'rose' },
    { name: 'Play', emoji: '🎮', color: 'violet' },
    { name: 'Socialize', emoji: '🎉', color: 'fuchsia' },
    { name: 'Travel', emoji: '✈️', color: 'cyan' }
  ];

  // Get color classes for a tag
  const getTagColorClasses = (tag) => {
    const isSelected = selectedTags.includes(tag.name) || (tag.name === 'Only For You' && activeSpecialTag === 'Only For You');
    
    if (!isSelected) {
      return 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400';
    }

    const colorMap = {
      indigo: 'bg-indigo-600 text-white border-indigo-600',
      rose: 'bg-rose-600 text-white border-rose-600',
      violet: 'bg-violet-600 text-white border-violet-600',
      amber: 'bg-amber-600 text-white border-amber-600',
      emerald: 'bg-emerald-600 text-white border-emerald-600',
      sky: 'bg-sky-600 text-white border-sky-600',
      fuchsia: 'bg-fuchsia-600 text-white border-fuchsia-600',
      cyan: 'bg-cyan-600 text-white border-cyan-600',
      orange: 'bg-orange-600 text-white border-orange-600',
      teal: 'bg-teal-600 text-white border-teal-600'
    };

    return colorMap[tag.color] || 'bg-indigo-600 text-white border-indigo-600';
  };

  // Handle single tag selection/deselection (single-select)
  const handleTagClick = (tagName) => {
    if (selectedTags[0] === tagName) {
      // Deselect if already selected
      onTagSelect([]);
    } else {
      // Only one tag can be selected at a time
      onTagSelect([tagName]);
    }
  };

  // Special navigation/filter options
  const handleSpecialTagClick = (tagName) => {
    // For 'Only For You', check if user is authenticated
    if (tagName === 'Only For You' && !isAuthenticated) {
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
    onSpecialTagSelect(tagName);
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
      <style>{`
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
      {/* Only show regular tag filter section if not hiding regular tags */}
      {!hideRegularTags && (
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto whitespace-nowrap">
          
          {/* Available tags */}
          {availableTags.map(tag => (
            <div key={tag.name} className="relative inline-block flex-shrink-0">
              {tag.name === 'Only For You' && showLoginTooltip && !isAuthenticated && (
                <div className="absolute -top-12 left-0 right-0 mx-auto w-48 bg-indigo-600 text-white text-xs rounded py-1 px-2 z-50 text-center">
                  Login required for personalized content
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-indigo-600"></div>
                </div>
              )}
              <button
                onClick={() => {
                  if (tag.name === 'Only For You' && !isAuthenticated) {
                    handleOnlyForYouClick();
                  } else if (tag.name === 'Only For You') {
                    handleSpecialTagClick(tag.name);
                  } else {
                    handleTagClick(tag.name);
                  }
                }}
                className={`
                  tag-item px-4 py-2 text-sm transition-all duration-200 flex items-center justify-center rounded-full border h-10 shadow-sm hover:shadow-md
                  ${getTagColorClasses(tag)}
                  ${tag.name === 'Only For You' && !isAuthenticated ? 'cursor-pointer opacity-80 hover:opacity-100' : ''}
                `}
              >
                <span className="mr-1.5 text-base">{tag.emoji}</span>
                <span className="font-medium text-sm">{tag.name}</span>
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
