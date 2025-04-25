import React from 'react';
import PropTypes from 'prop-types';

/**
 * CategoryFilter Component
 * 
 * Displays a responsive grid of category filters for the Explore page
 * Following Single Responsibility Principle - this component only handles category filtering UI
 * Implements responsive design to prevent horizontal scrolling (SOLID + UX best practices)
 */
const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="category-filter-wrapper w-full">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.value}
            onClick={() => onCategoryChange('category', category.value)}
            className={`flex items-center px-3 py-1.5 rounded-full transition-colors duration-200 text-xs sm:text-sm
              ${activeCategory === category.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {category.icon && (
              <span className="mr-1 text-xs">{category.icon}</span>
            )}
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// PropTypes for type checking
CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string
    })
  ),
  activeCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired
};

export default CategoryFilter;
