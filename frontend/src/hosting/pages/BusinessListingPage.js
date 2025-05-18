import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaPhone, FaGlobe, FaTag } from 'react-icons/fa';

/**
 * BusinessListingPage Component
 * 
 * Following Single Responsibility Principle:
 * - This component is responsible for the business listing form
 */
const BusinessListingPage = () => {
  const navigate = useNavigate();
  
  // Initial business data state
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    businessType: 'restaurant',
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '15:00', closed: true }
    },
    amenities: [],
    tags: []
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBusinessData({
      ...businessData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle business hours changes
  const handleHoursChange = (day, field, value) => {
    setBusinessData({
      ...businessData,
      businessHours: {
        ...businessData.businessHours,
        [day]: {
          ...businessData.businessHours[day],
          [field]: field === 'closed' ? value : value
        }
      }
    });
  };

  // Handle tags input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!businessData.tags.includes(newTag)) {
        setBusinessData({
          ...businessData,
          tags: [...businessData.tags, newTag]
        });
      }
      e.target.value = '';
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setBusinessData({
      ...businessData,
      tags: businessData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = businessData.amenities.includes(amenity)
      ? businessData.amenities.filter(a => a !== amenity)
      : [...businessData.amenities, amenity];
    
    setBusinessData({
      ...businessData,
      amenities: updatedAmenities
    });
  };

  // Handle business submission
  const handleListBusiness = (e) => {
    e.preventDefault();
    // Here you would typically send the business data to your API
    console.log('Listing business:', businessData);
    
    // Show success message
    alert('Business listed successfully! (This is a placeholder - actual API integration would happen here)');
    
    // Navigate back to host page
    navigate('/host');
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/host');
  };

  // Available business types
  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Café' },
    { value: 'bar', label: 'Bar' },
    { value: 'event_space', label: 'Event Space' },
    { value: 'coworking_space', label: 'Coworking Space' },
    { value: 'venue', label: 'Venue' },
    { value: 'studio', label: 'Studio' },
    { value: 'other', label: 'Other' }
  ];

  // Available amenities
  const availableAmenities = [
    { id: 'wifi', label: 'Free Wi-Fi' },
    { id: 'parking', label: 'Parking Available' },
    { id: 'outdoor_seating', label: 'Outdoor Seating' },
    { id: 'wheelchair', label: 'Wheelchair Accessible' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'delivery', label: 'Delivery Service' },
    { id: 'takeout', label: 'Takeout Available' },
    { id: 'private_rooms', label: 'Private Rooms' }
  ];

  // Day labels for business hours
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">List Your Business</h1>
            <p className="text-gray-600 mb-6">
              Share your business with the Tymout community and attract new customers
            </p>
            
            <form onSubmit={handleListBusiness}>
              {/* Business Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={businessData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your business name"
                  required
                />
              </div>
              
              {/* Business Type */}
              <div className="mb-4">
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type*
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={businessData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Business Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={businessData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe your business, what makes it special, and why people should visit"
                  required
                ></textarea>
              </div>
              
              {/* Contact Information */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaMapMarkerAlt className="inline mr-1" /> Address*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={businessData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Full address of your business"
                    required
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaPhone className="inline mr-1" /> Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={businessData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contact phone number"
                    required
                  />
                </div>
              </div>
              
              {/* Website */}
              <div className="mb-6">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaGlobe className="inline mr-1" /> Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={businessData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
              
              {/* Business Hours */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  <FaClock className="inline mr-1" /> Business Hours
                </h3>
                <div className="space-y-4">
                  {Object.keys(dayLabels).map((day) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                      <div className="w-full sm:w-24 mb-1 sm:mb-0">
                        <span className="font-medium text-sm text-gray-700">{dayLabels[day]}</span>
                      </div>
                      <div className="flex items-center mb-2 sm:mb-0">
                        <input
                          type="checkbox"
                          id={`closed-${day}`}
                          checked={businessData.businessHours[day].closed}
                          onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`closed-${day}`} className="ml-2 text-sm text-gray-700">
                          Closed
                        </label>
                      </div>
                      {!businessData.businessHours[day].closed && (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center">
                            <label htmlFor={`open-${day}`} className="mr-2 text-sm text-gray-700">
                              Open:
                            </label>
                            <input
                              type="time"
                              id={`open-${day}`}
                              value={businessData.businessHours[day].open}
                              onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex items-center">
                            <label htmlFor={`close-${day}`} className="mr-2 text-sm text-gray-700">
                              Close:
                            </label>
                            <input
                              type="time"
                              id={`close-${day}`}
                              value={businessData.businessHours[day].close}
                              onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableAmenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        checked={businessData.amenities.includes(amenity.id)}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`amenity-${amenity.id}`} className="ml-2 text-sm text-gray-700 truncate">
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaTag className="inline mr-1" /> Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {businessData.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                      <button 
                        type="button" 
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                        onClick={() => removeTag(tag)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  id="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type a tag and press Enter (e.g., family-friendly, vegan, live music)"
                  onKeyDown={handleTagInput}
                />
                <p className="mt-1 text-xs text-gray-500">Add tags to help users discover your business</p>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  List Business
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessListingPage;
