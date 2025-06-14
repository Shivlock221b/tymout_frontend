import React from 'react';
import { FaTimes } from 'react-icons/fa';
import ProductForm from './ProductForm';

/**
 * ProductModal Component
 * 
 * Single Responsibility: Display a modal for adding or editing products
 */
const ProductModal = ({ isOpen, product, shopId, categories, onClose, onSuccess }) => {
  if (!isOpen) return null;
  
  // Determine if we're editing or creating
  const mode = product ? 'Edit' : 'Add New';
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode} Product/Service
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <ProductForm
            product={product}
            shopId={shopId}
            categories={categories}
            onCancel={onClose}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
