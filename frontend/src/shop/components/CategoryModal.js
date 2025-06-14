import React from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import CategoryForm from './CategoryForm';

/**
 * CategoryModal Component
 * 
 * Single Responsibility: Provides a modal dialog for creating/editing categories
 */
const CategoryModal = ({ 
  isOpen, 
  onClose, 
  category = null, 
  onSubmit, 
  isSubmitting = false 
}) => {
  if (!isOpen) return null;
  
  const handleSubmit = (formData) => {
    // If we have a category, we're editing, otherwise creating
    if (category) {
      onSubmit({
        ...formData,
        id: category._id
      });
    } else {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-10 relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {category ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            <CategoryForm
              category={category}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

CategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default CategoryModal;
