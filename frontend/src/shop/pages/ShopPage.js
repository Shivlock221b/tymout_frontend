import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaStore, FaEdit, FaInfoCircle } from 'react-icons/fa';
import { useShopByUserId } from '../stores/shopStore';
import { useAuthStore } from '../../stores/authStore';
import CategoryScrollbar from '../components/CategoryScrollbar';
import FeedbackButton from '../components/FeedbackButton';
import ProductShopPage from '../components/ProductShopPage';
import { Link } from 'react-router-dom';
/**
 * ShopPage Component
 * 
 * Single Responsibility: Display shop information to users
 * This component handles:
 * 1. Fetching and displaying shop data
 * 2. Showing shop name, photo, and description at the top
 * 3. Providing navigation to edit the shop (for shop owners)
 */
const ShopPage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams(); // Get the userId from URL params if available
  const { user } = useAuthStore();
  const productsRef = useRef(null);
  
  // Determine which user's shop to display
  const targetUserId = shopId || user?._id;
  
  // Use React Query to fetch shop data for the target user
  const { 
    data: shopData, 
    isLoading, 
    error,
    refetch 
  } = useShopByUserId(targetUserId);
  
  // Check if the current user is the owner of this shop
  const isOwner = user && shopData && user._id === shopData.ownerId;
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleEdit = () => {
    navigate('/shop/edit');
  };
  
  // Component state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log('Category selected in ShopPage:', category);
    setSelectedCategory(category);
    // Scroll to products section
    if (productsRef.current) {
      window.scrollTo({
        top: productsRef.current.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Shop</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="animate-pulse">
              {/* Banner placeholder */}
              <div className="h-48 bg-gray-200 w-full"></div>
              
              <div className="p-6">
                {/* Shop name placeholder */}
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                
                {/* Description placeholder */}
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                
                {/* Contact info placeholder */}
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Shop</h1>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <p className="text-red-700">
                Error loading shop: {error.message || 'Unable to load shop data'}
              </p>
            </div>
            <button 
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Shop</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <FaStore className="mx-auto text-gray-300 text-5xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Shop Not Found</h2>
            <p className="text-gray-600 mb-6">The shop you're looking for doesn't exist or has been removed.</p>
            
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Explore Shops
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back</span>
        </button>
        
        {/* Shop Header */}
        <div className="bg-white mb-8">
          
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex items-center">
                {shopData.logo && (
                  <div className="mr-4 flex-shrink-0">
                    <img 
                      src={shopData.logo} 
                      alt={`${shopData.name} logo`}
                      className="w-16 h-16 object-cover rounded-full border-2 border-white shadow"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Logo';
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {shopData.name}
                    </h1>
                    <FeedbackButton 
                      shopId={shopData._id}
                      rating={shopData.rating || 4.0} 
                      reviewCount={shopData.reviewCount || 6800} 
                    />
                  </div>
                  {/* Business Information Link - Directly Below Name */}
                  <div className="mt-2 mb-1">
                    <Link 
                      to={`/shop/${shopData._id}/business-info`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      <FaInfoCircle className="text-indigo-600" size={16} />
                      <span>Business Information</span>
                    </Link>
                  </div>
                </div>
              </div>
              
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Shop
                </button>
              )}
            </div>
            

            
            {/* Shop Category */}
            {shopData.category && (
              <div className="mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                  {shopData.category}
                </span>
              </div>
            )}
            
            {/* Shop Description */}
            <p className="text-gray-600 mb-6" style={{ whiteSpace: 'pre-wrap' }}>
              {shopData.description}
            </p>
            
            {/* Categories Section */}
            <div className="mt-6">
              <CategoryScrollbar shopId={shopData._id} onCategorySelect={handleCategorySelect} />
            </div>

            {/* Products Section */}
            <div ref={productsRef} className="mt-8">
              <ProductShopPage 
                shopId={shopData._id} 
                selectedCategoryId={selectedCategory ? selectedCategory._id : null} 
              />
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;