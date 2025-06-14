import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaStore, FaUtensils, FaHotel, FaEdit, FaClipboardList, FaHistory } from 'react-icons/fa';

/**
 * BusinessSetupPage Component
 * 
 * Following Single Responsibility Principle:
 * - This component is responsible for guiding users through the business setup process
 * - It provides information about hosting a business and links to the detailed listing form
 * - It also serves as a hub for managing existing businesses
 */
const BusinessSetupPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('setup'); // 'setup' or 'manage'

  // Business management actions from ShopPage
  const businessActions = [
    { key: 'edit-info', label: 'Edit Business Info', path: '/shop/edit', icon: <FaEdit className="text-2xl text-indigo-600" /> },
    { key: 'edit-catalogue', label: 'Edit Catalogue', path: '/shop/catalogue', icon: <FaClipboardList className="text-2xl text-indigo-600" /> },
    { key: 'past-orders', label: 'Past Orders', path: '/shop/past-orders', icon: <FaHistory className="text-2xl text-indigo-600" /> },
  ];

  // Handle back button click
  const handleBack = () => {
    navigate('/host');
  };

  // Handle continue to listing form
  const handleContinueToListing = () => {
    navigate('/host/list-business');
  };
  
  // Handle navigation to business management pages
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Host Dashboard</span>
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Business Center</h1>
            <p className="text-gray-600 mb-6">
              Set up a new business or manage your existing business on Tymout
            </p>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'setup'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  New Business Setup
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'manage'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Your Business
                </button>
              </nav>
            </div>
            
            {activeTab === 'setup' ? (
              <>
                {/* Business Types Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Types We Support</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                      <FaStore className="text-indigo-600 text-3xl mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">Retail Shops</h3>
                      <p className="text-gray-600 text-sm">Boutiques, specialty stores, and local retailers</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                      <FaUtensils className="text-indigo-600 text-3xl mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">Food & Beverage</h3>
                      <p className="text-gray-600 text-sm">Restaurants, cafes, bakeries, and food experiences</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                      <FaHotel className="text-indigo-600 text-3xl mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">Venues & Spaces</h3>
                      <p className="text-gray-600 text-sm">Event spaces, coworking areas, and unique venues</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                      <FaBuilding className="text-indigo-600 text-3xl mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                      <p className="text-gray-600 text-sm">Professional services, classes, and workshops</p>
                    </div>
                  </div>
                </div>
                
                {/* Benefits Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Hosting</h2>
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Connect with local customers interested in authentic experiences</li>
                      <li>Increase visibility in your community</li>
                      <li>Create special events and promotions for Tymout users</li>
                      <li>Receive feedback and build relationships with customers</li>
                      <li>Simple listing process with flexible options</li>
                    </ul>
                  </div>
                </div>
                
                {/* Next Steps */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to List Your Business?</h2>
                  <p className="text-gray-600 mb-6">
                    The next step is to fill out our business listing form. You'll need:
                  </p>
                  <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-600">
                    <li>Basic business information (name, address, contact details)</li>
                    <li>Business description and category</li>
                    <li>Operating hours</li>
                    <li>Photos of your business (at least one, up to five)</li>
                    <li>Available amenities and services</li>
                  </ul>
                  
                  <button
                    onClick={handleContinueToListing}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                  >
                    <span className="font-medium">Continue to Business Listing Form</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Your Business</h2>
                <p className="text-gray-600 mb-6">
                  Use these tools to manage your existing business on Tymout
                </p>
                
                {/* Business Management Actions */}
                <div className="space-y-4">
                  {businessActions.map(action => (
                    <div 
                      key={action.key}
                      onClick={() => handleNavigate(action.path)}
                      className="border border-gray-200 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="mr-4">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{action.label}</h3>
                        <p className="text-gray-600 text-sm">
                          {action.key === 'edit-info' && 'Update your business details, hours, and contact information'}
                          {action.key === 'edit-catalogue' && 'Manage your products, services, and pricing'}
                          {action.key === 'past-orders' && 'View and manage your order history'}
                        </p>
                      </div>
                      <div className="text-indigo-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetupPage;
