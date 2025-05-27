import React from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaTrash } from 'react-icons/fa';

/**
 * CategoryCard Component
 * 
 * Single Responsibility: Displays a single category with actions
 */
const CategoryCard = ({ 
  category, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Category Image */}
        {category.image ? (
          <div className="w-24 h-24 flex-shrink-0">
            <img 
              src={category.image} 
              alt={category.name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-xs text-center px-2">No Image</span>
          </div>
        )}
        
        {/* Category Details */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
            )}
          </div>
          
          {/* Display Order */}
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Order: {category.displayOrder || 0}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 flex flex-col justify-center space-y-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label={`Edit ${category.name}`}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label={`Delete ${category.name}`}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    displayOrder: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default CategoryCard;
