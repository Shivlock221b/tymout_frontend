import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';

/**
 * CircleCreationPage Component
 * 
 * Following Single Responsibility Principle:
 * - This component is responsible for the circle creation form
 */
const CircleCreationPage = () => {
  const navigate = useNavigate();
  
  // Initial circle data state
  const [circleData, setCircleData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: 10,
    isPublic: true,
    meetingFrequency: 'weekly',
    tags: []
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCircleData({
      ...circleData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle tags input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!circleData.tags.includes(newTag)) {
        setCircleData({
          ...circleData,
          tags: [...circleData.tags, newTag]
        });
      }
      e.target.value = '';
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setCircleData({
      ...circleData,
      tags: circleData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle circle submission
  const handleCreateCircle = (e) => {
    e.preventDefault();
    // Here you would typically send the circle data to your API
    console.log('Creating circle:', circleData);
    
    // Show success message
    alert('Circle created successfully! (This is a placeholder - actual API integration would happen here)');
    
    // Navigate back to host page
    navigate('/host');
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/host');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Start a Circle</h1>
            <p className="text-gray-600 mb-6">
              Create your own community circle and connect with people who share your interests
            </p>
            
            <form onSubmit={handleCreateCircle}>
              {/* Circle Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Circle Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={circleData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Give your circle a memorable name"
                  required
                />
              </div>
              
              {/* Circle Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={circleData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="What is this circle about? What can members expect?"
                  required
                ></textarea>
              </div>
              
              {/* Location */}
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-1" /> Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={circleData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Where will your circle typically meet?"
                />
              </div>
              
              {/* Member Capacity */}
              <div className="mb-4">
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUsers className="inline mr-1" /> Member Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="2"
                  max="100"
                  value={circleData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum number of members allowed in your circle</p>
              </div>
              
              {/* Meeting Frequency */}
              <div className="mb-4">
                <label htmlFor="meetingFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline mr-1" /> Meeting Frequency
                </label>
                <select
                  id="meetingFrequency"
                  name="meetingFrequency"
                  value={circleData.meetingFrequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {/* Privacy Setting */}
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={circleData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Make this circle publicly discoverable
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  If unchecked, people can only join by direct invitation
                </p>
              </div>
              
              {/* Tags */}
              <div className="mb-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaTag className="inline mr-1" /> Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {circleData.tags.map((tag, index) => (
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
                  placeholder="Type a tag and press Enter"
                  onKeyDown={handleTagInput}
                />
                <p className="mt-1 text-xs text-gray-500">Help others discover your circle with relevant tags</p>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleCreationPage;
