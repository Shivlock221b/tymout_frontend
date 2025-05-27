import React, { useState } from 'react';
import { FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import { useCreateProduct, useUpdateProduct } from '../queries/productQueries';

/**
 * ProductForm Component
 * 
 * Single Responsibility: Provide a form for creating and editing products
 * This component handles:
 * 1. Collecting product information from the user
 * 2. Submitting the data to create or update a product
 */
const ProductForm = ({ product, shopId, categories, onSuccess, onCancel }) => {
  const isEditing = !!product;
  
  // Initial form state
  const initialState = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    images: [],
    inStock: true,
    stockQuantity: 0,
    isService: false,
    ...product
  };
  
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState(product?.images || []);
  
  // Mutations for creating and updating products
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear error for this field when user edits it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? '' : parseFloat(value);
    
    setFormData({
      ...formData,
      [name]: numberValue
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle image uploads (mock implementation - would be replaced with actual upload logic)
  const handleImageUpload = (e) => {
    // Mock image URL for demonstration
    const mockImageUrl = `https://via.placeholder.com/300?text=Product+Image+${images.length + 1}`;
    const newImages = [...images, mockImageUrl];
    setImages(newImages);
    
    setFormData({
      ...formData,
      images: newImages
    });
  };
  
  // Remove an image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    setFormData({
      ...formData,
      images: newImages
    });
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price && formData.price !== 0) {
      newErrors.price = 'Price is required';
    } else if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (formData.discountPrice && formData.discountPrice > formData.price) {
      newErrors.discountPrice = 'Discount price cannot be higher than the regular price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Prepare the data for submission
    const productData = {
      ...formData,
      shopId: shopId
    };
    
    try {
      if (isEditing) {
        // Update existing product
        await updateProduct.mutateAsync({
          productId: product._id,
          productData: productData
        });
      } else {
        // Create new product
        await createProduct.mutateAsync(productData);
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Handle submission errors
      console.error('Error saving product:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to save product. Please try again.'
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          placeholder="Enter product name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      {/* Product Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter product description"
        ></textarea>
      </div>
      
      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select Category --</option>
          {categories?.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Product Type */}
      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isService"
            name="isService"
            checked={formData.isService}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isService" className="ml-2 block text-sm text-gray-700">
            This is a service (not a physical product)
          </label>
        </div>
      </div>
      
      {/* Price Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleNumberChange}
              min="0"
              step="0.01"
              className={`w-full pl-7 pr-3 py-2 border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="0.00"
            />
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Discount Price (Optional)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="discountPrice"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleNumberChange}
              min="0"
              step="0.01"
              className={`w-full pl-7 pr-3 py-2 border ${
                errors.discountPrice ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="0.00"
            />
          </div>
          {errors.discountPrice && <p className="mt-1 text-sm text-red-600">{errors.discountPrice}</p>}
        </div>
      </div>
      
      {/* Stock Information - Only for physical products */}
      {!formData.isService && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                In Stock
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity (0 = unlimited)
            </label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleNumberChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
          </div>
        </div>
      )}
      
      {/* Product Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Existing Images */}
          {images.map((image, index) => (
            <div key={index} className="relative border border-gray-300 rounded-md overflow-hidden h-32">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                aria-label="Remove image"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ))}
          
          {/* Upload New Image Button */}
          <button
            type="button"
            onClick={handleImageUpload}
            className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FaImage className="text-gray-400 text-3xl mb-2" />
            <span className="text-sm text-gray-500">Add Image</span>
          </button>
        </div>
      </div>
      
      {/* Form Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{errors.submit}</p>
        </div>
      )}
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={createProduct.isPending || updateProduct.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(createProduct.isPending || updateProduct.isPending) ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Product' : 'Create Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
