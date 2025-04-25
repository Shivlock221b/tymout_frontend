import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaArrowRight } from 'react-icons/fa';

/**
 * HostPage Component
 * 
 * Following Single Responsibility Principle:
 * - This component is responsible for the overall host dashboard layout and navigation
 * - Each tab redirects to a dedicated page for that functionality
 */
const HostPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="mt-1 text-gray-600">Choose what you'd like to host or create</p>
        </div>
        
        {/* Main Content Area */}
          <div className="w-full max-w-full overflow-x-hidden">
            {/* Hosting Information */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Hosting on Tymout</h2>
                  <p className="text-gray-600 mb-6">
                    Hosting on Tymout is a great way to connect with people who share your interests and passions. 
                    Whether you're hosting a dinner table, creating a community circle, or listing your business, 
                    we're here to help you build meaningful connections.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-2">Host Guidelines</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Learn about our community standards and best practices for hosting successful events.
                      </p>
                      <a href="/guidelines" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Read more →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-2">Safety Tips</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Review our safety recommendations to ensure a positive experience for everyone.
                      </p>
                      <a href="/safety" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Read more →
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium text-gray-900 mb-2">Support</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Get help from our support team if you have any questions or concerns.
                      </p>
                      <a href="/contact" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Contact support →
                      </a>
                    </div>
                  </div>
                  
                  {/* Create a Table Button */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => navigate('/host/create-table')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                    >
                      <FaCalendarPlus className="h-5 w-5 mr-2" />
                      <span className="font-medium">Create a Table</span>
                    </button>
                  </div>
                </div>
              </div>
            
            {/* Commented out Circle and Business sections for now
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mt-6">
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-medium text-gray-900">Start a Circle</h2>
                  <p className="text-gray-600 mt-2 mb-4">
                    Build a community around shared interests or activities with recurring meetups.
                  </p>
                  <button
                    onClick={() => navigate('/host/start-circle')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <span className="mr-2">Get Started</span>
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mt-6">
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-medium text-gray-900">List Your Business</h2>
                  <p className="text-gray-600 mt-2 mb-4">
                    Connect your venue or service with potential clients and grow your business.
                  </p>
                  <button
                    onClick={() => navigate('/host/list-business')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <span className="mr-2">Get Started</span>
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            */}
          </div>
      </div>
    </div>
  );
};

export default HostPage;
