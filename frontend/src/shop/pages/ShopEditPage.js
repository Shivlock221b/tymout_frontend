import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStore, FaSave } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { useShopStore } from '../stores/shopStore';

/**
 * ShopEditPage Component
 * 
 * Single Responsibility: Provides interface for users to create/edit their shop profile
 * This component handles:
 * 1. Loading existing shop data if available
 * 2. Form for editing shop details
 * 3. Saving shop information
 */
const ShopEditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchShopByUserId, updateShop, createShop } = useShopStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    logo: '',
    bannerImage: '',
    isActive: true
  });
  
  // Categories for shop selection
  const categories = [
    'Clothing & Accessories',
    'Electronics',
    'Home & Garden',
    'Beauty & Personal Care',
    'Food & Beverages',
    'Arts & Crafts',
    'Sports & Outdoors',
    'Books & Media',
    'Health & Wellness',
    'Other'
  ];

  useEffect(() => {
    const loadShopData = async () => {
      if (!user?._id) {
        navigate('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        const existingShop = await fetchShopByUserId(user._id);
        
        if (existingShop) {
          setShopData({
            name: existingShop.name || '',
            description: existingShop.description || '',
            category: existingShop.category || '',
            contactEmail: existingShop.contactEmail || user.email || '',
            contactPhone: existingShop.contactPhone || '',
            address: existingShop.address || '',
            logo: existingShop.logo || '',
            bannerImage: existingShop.bannerImage || '',
            isActive: existingShop.isActive !== undefined ? existingShop.isActive : true
          });
        } else {
          // Pre-fill with user data if available
          setShopData(prev => ({
            ...prev,
            contactEmail: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading shop data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShopData();
  }, [user, navigate, fetchShopByUserId]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShopData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shopData.name || !shopData.description || !shopData.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Determine if we're creating or updating
      const existingShop = await fetchShopByUserId(user._id);
      
      if (existingShop) {
        await updateShop({
          ...shopData,
          id: existingShop._id
        });
      } else {
        await createShop({
          ...shopData,
          ownerId: user._id
        });
      }
      
      // Redirect to shop profile page
      navigate('/shop/profile');
    } catch (error) {
      console.error('Error saving shop:', error);
      alert('Failed to save shop data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Business Management</h1>
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
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleCancel}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold flex items-center">
          <FaStore className="mr-2 text-indigo-600" />
          {shopData.name ? 'Edit Business Info' : 'Create Business Info'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-6">
            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={shopData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your business name"
                required
              />
            </div>
            
            {/* Business Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={shopData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={shopData.contactEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter contact email"
              />
            </div>
            
            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={shopData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter contact phone"
              />
            </div>
            
            {/* Business Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shopData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter business address"
              />
            </div>
            
            {/* Business Logo URL */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={shopData.logo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter logo URL"
              />
            </div>
            
            {/* Business Banner Image URL */}
            <div>
              <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                id="bannerImage"
                name="bannerImage"
                value={shopData.bannerImage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter banner image URL"
              />
            </div>
            
            {/* Shop Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={shopData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your shop"
                required
              ></textarea>
            </div>
            
            {/* Shop Status */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={shopData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Shop is active and visible to customers
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Shop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopEditPage;
