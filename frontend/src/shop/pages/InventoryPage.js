import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { useShopByUserId } from '../stores/shopStore';

/**
 * InventoryPage Component
 * 
 * Single Responsibility: Provides interface for business owners to manage their inventory
 */
const InventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Fetch the shop data for the current user
  const { 
    data: shopData, 
    isLoading, 
    error 
  } = useShopByUserId(user?._id);
  
  const handleBack = () => {
    navigate('/shop/catalogue');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <p className="text-red-700">
                Error loading shop data: {error.message || 'Unable to load shop data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render no shop state
  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
            <p className="text-gray-600 mb-6">You need to set up your shop before you can manage your inventory.</p>
            
            <button
              onClick={() => navigate('/shop/edit')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Set Up Your Shop
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-gray-600">{shopData.name}</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Inventory Management</h2>
              <button
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Update Stock
              </button>
            </div>
            
            {/* Placeholder for inventory management */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No inventory items to manage.</p>
              <p className="text-gray-500">Add products first to manage your inventory.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
