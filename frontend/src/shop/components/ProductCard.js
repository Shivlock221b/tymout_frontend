import React from 'react';
import { FaEdit, FaTrash, FaTags } from 'react-icons/fa';

/**
 * ProductCard Component
 * 
 * Single Responsibility: Display a product or service card with actions
 */
const ProductCard = ({ product, onEdit, onDelete }) => {
  const {
    name,
    description,
    price,
    discountPrice,
    images,
    categoryName,
    inStock,
    isService
  } = product;
  
  // Format price for display
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get the first image or use a placeholder
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : `https://via.placeholder.com/300?text=${encodeURIComponent(name || 'Product')}`;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300?text=Image+Error";
          }}
        />
        
        {/* Availability Badge */}
        {!isService && !inStock && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs uppercase font-semibold">
            Out of Stock
          </div>
        )}
        
        {/* Type Badge */}
        <div className={`absolute top-0 left-0 ${isService ? 'bg-indigo-500' : 'bg-green-500'} text-white px-2 py-1 text-xs uppercase font-semibold`}>
          {isService ? 'Service' : 'Product'}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{name}</h3>
        
        {/* Category */}
        {categoryName && (
          <div className="flex items-center mb-2 text-gray-600 text-sm">
            <FaTags className="mr-1 text-indigo-500" />
            <span>{categoryName}</span>
          </div>
        )}
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        )}
        
        {/* Price */}
        <div className="flex items-end mt-auto">
          {discountPrice ? (
            <div className="flex items-center">
              <span className="text-lg font-bold text-indigo-700">
                {formatPrice(discountPrice)}
              </span>
              <span className="ml-2 text-sm line-through text-gray-500">
                {formatPrice(price)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-indigo-700">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
          aria-label="Edit product"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
          aria-label="Delete product"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
