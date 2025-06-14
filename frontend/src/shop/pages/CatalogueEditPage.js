import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaTags, FaList, FaBoxOpen, FaClipboard } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { useShopByUserId } from '../stores/shopStore';

/**
 * CatalogueEditPage Component
 * 
 * Single Responsibility: Provides interface for business owners to manage their product/service catalogue
 * This component handles:
 * 1. Loading existing shop data
 * 2. Displaying tabs for different catalogue management sections
 * 3. Navigation between catalogue sections
 */
const CatalogueEditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user?._id) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleBack = () => {
    navigate('/host/business');
  };
  
  // Fetch the shop data for the current user
  const { 
    data: shopData, 
    isLoading, 
    error 
  } = useShopByUserId(user?._id);
  
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
            <h1 className="text-2xl font-bold">Edit Catalogue</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
              
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
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
            <h1 className="text-2xl font-bold">Edit Catalogue</h1>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <p className="text-red-700">
                Error loading shop data: {error.message || 'Unable to load shop data'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/shop/edit')}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Set Up Your Shop First
            </button>
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
            <h1 className="text-2xl font-bold">Edit Catalogue</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
            <p className="text-gray-600 mb-6">You need to set up your shop before you can manage your catalogue.</p>
            
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
            <h1 className="text-2xl font-bold">Edit Catalogue</h1>
            <p className="text-gray-600">{shopData.name}</p>
          </div>
        </div>
        
        {/* Main Content - Completely redesigned to avoid ResizeObserver errors */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Catalogue Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Using direct Links instead of buttons with state changes */}
              <Link 
                to="/shop/catalogue/products" 
                className="no-underline"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center">
                  <div className="bg-indigo-50 p-3 rounded-full mr-4">
                    <FaList className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Products & Services</h3>
                    <p className="text-sm text-gray-500">Manage your product and service offerings</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/shop/catalogue/categories" 
                className="no-underline"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center">
                  <div className="bg-indigo-50 p-3 rounded-full mr-4">
                    <FaTags className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Categories</h3>
                    <p className="text-sm text-gray-500">Organize your products by category</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/shop/catalogue/inventory" 
                className="no-underline"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center">
                  <div className="bg-indigo-50 p-3 rounded-full mr-4">
                    <FaBoxOpen className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Inventory</h3>
                    <p className="text-sm text-gray-500">Manage your stock and availability</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/shop/catalogue/template" 
                className="no-underline"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center">
                  <div className="bg-indigo-50 p-3 rounded-full mr-4">
                    <FaClipboard className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Template</h3>
                    <p className="text-sm text-gray-500">Create standardized product templates</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogueEditPage;
