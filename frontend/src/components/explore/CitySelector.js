import React from 'react';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * CitySelector Component
 * 
 * Displays the current city with an option to change it
 * Following Single Responsibility Principle - only handles city selection
 */
const CitySelector = ({ currentCity, onCityChange }) => {
  const navigate = useNavigate();
  
  // Navigate to the city select page when clicked
  const handleCitySelectorClick = () => {
    navigate('/city-select', { 
      state: { 
        currentCity: currentCity || 'Agra',
        returnTo: '/explore'
      }
    });
  };
  
  return (
    <div className="relative">
      {/* Current City Display - Now navigates to CitySelectPage */}
      <div 
        className="flex items-center cursor-pointer py-2 text-indigo-600"
        onClick={handleCitySelectorClick}
      >
        <FaMapMarkerAlt className="text-indigo-600 mr-2" />
        <span className="text-base font-medium mr-2">{currentCity || 'Select City'}</span>
        <FaChevronDown className="text-indigo-500" />
      </div>
    </div>
  );
};

export default CitySelector;
