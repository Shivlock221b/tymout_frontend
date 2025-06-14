import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaImage, FaTimes } from 'react-icons/fa';

/**
 * CategoryForm Component
 * 
 * Single Responsibility: Provides form for creating and editing categories
 */
const CategoryForm = ({ 
  category = null, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0
  });
  
  // Preview image state
  const [imagePreview, setImagePreview] = useState('');
  
  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        displayOrder: category.displayOrder || 0
      });
      
      if (category.image) {
        setImagePreview(category.image);
      }
    }
  }, [category]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll just create a local preview
      // In a real app, you'd upload to a storage service
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFormData(prev => ({
          ...prev,
          image: event.target.result // In production, this would be a URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Clear image
  const handleClearImage = () => {
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Category Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Electronics, Clothing, Services"
        />
      </div>
      
      {/* Category Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe this category..."
        ></textarea>
      </div>
      
      {/* Category Image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Category Image
        </label>
        <div className="mt-1 flex items-center">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Category preview" 
                className="h-32 w-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                aria-label="Remove image"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-md">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <FaImage className="h-8 w-8 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Upload image</span>
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Recommended: Square image, at least 300x300px
        </p>
      </div>
      
      {/* Display Order */}
      <div>
        <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          id="displayOrder"
          name="displayOrder"
          value={formData.displayOrder}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          min="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          Lower numbers appear first
        </p>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
        </button>
      </div>
    </form>
  );
};

CategoryForm.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    displayOrder: PropTypes.number
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default CategoryForm;
