import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

/**
 * CitySelectPage
 * 
 * A dedicated page for city selection with a WhatsApp-like chat interface style
 * Preserves functionality while updating the UI
 */
const CitySelectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract current city and return path from location state or use defaults
  const { currentCity = 'Agra', returnTo = '/explore' } = location.state || {};
  
  // Available cities - limited to current options
  const cities = [
    { id: 'gurugram', name: 'Gurugram' },
    { id: 'agra', name: 'Agra' }
  ];
  
  const handleCitySelect = (city) => {
    // Navigate back to the previous page with the selected city
    navigate(returnTo, { 
      state: { selectedCity: city },
      replace: true // Replace the current history entry to avoid back button issues
    });
    
    // Add console log to confirm city selection
    console.log('Selected city:', city, 'Navigating to:', returnTo);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold">Select City</h1>
      </div>
      
      {/* Current City Display */}
      <div className="px-4 py-4 bg-white">
        <div className="flex items-center">
          <FaMapMarkerAlt className="text-indigo-600 h-5 w-5 mr-2" />
          <span className="font-medium text-gray-800">Current: {currentCity}</span>
        </div>
      </div>
      
      {/* Cities List - Styled like WhatsApp chat list */}
      <div className="mt-2 bg-white">
        <div className="divide-y divide-gray-100">
          {cities.map(city => (
            <div 
              key={city.id}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => handleCitySelect(city.name)}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="text-indigo-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{city.name}</span>
                  {currentCity === city.name && (
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {city.name === 'Gurugram' ? 'Cyber Hub, NCR' : 'City of the Taj Mahal'}
                </p>
              </div>
              {/* Chevron indicator */}
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>
      
      {/* Note about additional cities */}
      <div className="p-4 text-center text-gray-500 text-sm">
        More cities coming soon!
      </div>
    </div>
  );
};

export default CitySelectPage;
