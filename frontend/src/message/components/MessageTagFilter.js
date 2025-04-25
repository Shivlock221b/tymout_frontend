import React from 'react';
import PropTypes from 'prop-types';

/**
 * MessageTagFilter Component
 * 
 * Following Single Responsibility Principle:
 * - This component is only responsible for rendering tag filter buttons
 * - It handles the visual presentation and interaction for tag filtering
 */
const MessageTagFilter = ({ availableTags, selectedTag, onTagSelect, onClearFilter }) => {
  // Get tag-specific styling
  const getTagStyles = (tag) => {
    const isSelected = selectedTag === tag;
    
    const baseStyles = {
      Table: {
        bg: isSelected ? 'bg-blue-500' : 'bg-blue-50',
        text: isSelected ? 'text-white' : 'text-blue-700',
        hover: 'hover:bg-blue-100',
        border: isSelected ? 'border-blue-500' : 'border-blue-200'
      },
      Circle: {
        bg: isSelected ? 'bg-amber-500' : 'bg-amber-50',
        text: isSelected ? 'text-white' : 'text-amber-700',
        hover: 'hover:bg-amber-100',
        border: isSelected ? 'border-amber-500' : 'border-amber-200'
      },
      Private: {
        bg: isSelected ? 'bg-purple-500' : 'bg-purple-50',
        text: isSelected ? 'text-white' : 'text-purple-700',
        hover: 'hover:bg-purple-100',
        border: isSelected ? 'border-purple-500' : 'border-purple-200'
      },
      Notification: {
        bg: isSelected ? 'bg-green-500' : 'bg-green-50',
        text: isSelected ? 'text-white' : 'text-green-700',
        hover: 'hover:bg-green-100',
        border: isSelected ? 'border-green-500' : 'border-green-200'
      },
      Hostings: {
        bg: isSelected ? 'bg-teal-500' : 'bg-teal-50',
        text: isSelected ? 'text-white' : 'text-teal-700',
        hover: 'hover:bg-teal-100',
        border: isSelected ? 'border-teal-500' : 'border-teal-200'
      },
      Archieve: {
        bg: isSelected ? 'bg-gray-700' : 'bg-gray-100',
        text: isSelected ? 'text-white' : 'text-gray-700',
        hover: 'hover:bg-gray-200',
        border: isSelected ? 'border-gray-700' : 'border-gray-200'
      }
    };
    
    const styles = baseStyles[tag] || {
      bg: isSelected ? 'bg-gray-500' : 'bg-gray-50',
      text: isSelected ? 'text-white' : 'text-gray-700',
      hover: 'hover:bg-gray-100',
      border: isSelected ? 'border-gray-500' : 'border-gray-200'
    };
    
    return `${styles.bg} ${styles.text} ${isSelected ? '' : styles.hover} border ${styles.border}`;
  };
  
  // Always show these default tags
  const defaultTags = ["Table", "Circle", "Hostings", "Archieve"];
  // Merge default tags with availableTags, avoiding duplicates
  const mergedTags = Array.from(new Set([...defaultTags, ...availableTags]));

  // Check if there are any threads with the 'Table' tag
  const hasTableThreads = availableTags.includes('Table');

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-700">Filter by category</h2>
        {selectedTag && (
          <button 
            onClick={onClearFilter}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Clear filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {mergedTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${getTagStyles(tag)}`}
          >
            {tag}
          </button>
        ))}
      </div>

    </div>
  );
};

MessageTagFilter.propTypes = {
  availableTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTag: PropTypes.string,
  onTagSelect: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired
};

MessageTagFilter.defaultProps = {
  selectedTag: null
};

export default MessageTagFilter;
