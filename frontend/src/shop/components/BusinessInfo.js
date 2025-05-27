import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

/**
 * BusinessInfo Component
 * 
 * Single Responsibility: Display business contact information for a shop
 * This component handles:
 * 1. Displaying shop address, phone, and email
 * 2. Providing a consistent layout for business information
 */
const BusinessInfo = ({ shopData }) => {
  if (!shopData) {
    return null;
  }
  
  return (
    <div className="border-t border-gray-200 pt-4 mt-4" id="business-info">
      <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
      <div className="space-y-2">
        {shopData.address && (
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-indigo-600" />
            <span>{shopData.address}</span>
          </div>
        )}
        
        {shopData.contactPhone && (
          <div className="flex items-center text-gray-600">
            <FaPhone className="mr-2 text-indigo-600" />
            <span>{shopData.contactPhone}</span>
          </div>
        )}
        
        {shopData.contactEmail && (
          <div className="flex items-center text-gray-600">
            <FaEnvelope className="mr-2 text-indigo-600" />
            <span>{shopData.contactEmail}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessInfo;
