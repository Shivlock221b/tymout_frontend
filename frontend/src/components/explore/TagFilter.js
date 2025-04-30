import React from 'react';
import PropTypes from 'prop-types';

/**
 * TagFilter Component
 * 
 * Following Single Responsibility Principle:
 * - This component handles only tag filtering functionality
 * - It provides a visually appealing UI with rounded borders
 * - Allows selection of multiple tags for filtering content
 */
const TagFilter = ({ onTagSelect, selectedTags = [], onSpecialTagSelect, activeSpecialTag = null, hideRegularTags = false }) => {
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
    // Pass the clicked special tag to parent component
    onSpecialTagSelect(tag);
  };

  return (
    <>
      {/* Only show regular tag filter section if not hiding regular tags */}
      {!hideRegularTags && (
        <div className="flex items-center w-full">
          
          {/* Available tags */}
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => (tag === 'Only For You' || tag === 'All') ? handleSpecialTagClick(tag) : handleTagClick(tag)}
              className={`
                tag-item flex-1 px-5 py-3 text-lg font-medium transition-all duration-200 flex items-center justify-center border-none !ml-0 !mr-0
                ${(selectedTags.includes(tag) || (tag === 'Only For You' && activeSpecialTag === 'Only For You') || (tag === 'All' && activeSpecialTag === 'All'))
                  ? 'bg-white/30 text-white border-b-2 border-white' 
                  : 'bg-transparent text-white hover:bg-white/20'}
              `}
            >
              {tag}
            </button>
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
