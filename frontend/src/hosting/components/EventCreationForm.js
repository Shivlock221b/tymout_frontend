import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaTags } from 'react-icons/fa';
import { locationOptions } from '../data/mockHostData';

/**
 * EventCreationForm Component
 *
 * Single Responsibility: Handles the UI and direct event handling for creating events
 * Interface Segregation: Only accepts props it needs for operation
 */
const EventCreationForm = ({ eventData, onEventDataChange, onSubmit, selectedTemplate }) => {
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (type === 'checkbox') {
      onEventDataChange({ [name]: checked });
    } else if (type === 'radio') {
      // Toggle table visibility
      onEventDataChange({ [name]: value === 'public' });
    } else if (name === 'maxAttendees') {
      onEventDataChange({ [name]: parseInt(value, 10) || '' });
    } else {
      onEventDataChange({ [name]: value });
    }
  };

  // Generate time options in half-hour increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      // Convert to 12-hour format
      const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      const ampm = hour < 12 ? 'AM' : 'PM';
      
      // Store in 24-hour format for backend, but display in 12-hour format
      const hour24 = hour.toString().padStart(2, '0');
      
      options.push({
        value: `${hour24}:00`,
        label: `${displayHour}:00 ${ampm}`
      });
      options.push({
        value: `${hour24}:30`,
        label: `${displayHour}:30 ${ampm}`
      });
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();

  const handleTagsChange = (e) => {
    const tagText = e.target.value;
    // Convert comma-separated text to array
    const tagsArray = tagText.split(',').map(tag => tag.trim()).filter(tag => tag);
    onEventDataChange({ tags: tagsArray });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!eventData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!eventData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!eventData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!eventData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!eventData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(e);
    }
  };
  
  // Format tags for display in the input field
  const tagsString = eventData.tags ? eventData.tags.join(', ') : '';

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Create a Table</h2>
        {selectedTemplate && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Using template: {selectedTemplate.name}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Table Title*
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                value={eventData.title}
                onChange={handleChange}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.title 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows="4"
                value={eventData.description}
                onChange={handleChange}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Describe what your table is about and what participants can expect.
            </p>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Field */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  Date*
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.date
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Time Field */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaClock className="mr-2 text-gray-400" />
                  Time*
                </span>
              </label>
              <div className="mt-1">
                <select
                  name="time"
                  id="time"
                  value={eventData.time}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.time
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                >
                  <option value="">Select a time</option>
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Duration & Max Attendees Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration Field */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaClock className="mr-2 text-gray-400" />
                  Duration (minutes)
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  min="15"
                  step="15"
                  value={eventData.duration || ''}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Max Attendees Field */}
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaUsers className="mr-2 text-gray-400" />
                  Max Attendees
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="maxAttendees"
                  id="maxAttendees"
                  min="1"
                  value={eventData.maxAttendees || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                Location*
              </span>
            </label>
            <div className="mt-1">
              <select
                id="location"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.location
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              >
                <option value="">Select a location</option>
                {locationOptions.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaTags className="mr-2 text-gray-400" />
                Tags (comma separated)
              </span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="tags"
                id="tags"
                value={tagsString}
                onChange={handleTagsChange}
                placeholder="e.g., coffee, networking, casual"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Add relevant tags to help people find your table
            </p>
          </div>

          {/* Table Type Toggle */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Table Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Public */}
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  id="publicTable"
                  name="isPublic"
                  value="public"
                  checked={eventData.isPublic}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2">
                  <span className="font-medium text-gray-700">Public Table</span>
                  <p className="text-gray-500 text-sm">These tables will be visible on the Experience page after approval.</p>
                </span>
              </label>
              {/* Private */}
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  id="privateTable"
                  name="isPublic"
                  value="private"
                  checked={!eventData.isPublic}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <span className="ml-2">
                  <span className="font-medium text-gray-700">Private Table</span>
                  <p className="text-gray-500 text-sm">These are not shown to other community members but you can share the link to your table.</p>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Table
          </button>
        </div>
      </form>
    </div>
  );
};

EventCreationForm.propTypes = {
  eventData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    location: PropTypes.string,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxAttendees: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isPublic: PropTypes.bool,
    isRecurring: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onEventDataChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedTemplate: PropTypes.object
};

EventCreationForm.defaultProps = {
  selectedTemplate: null
};

export default EventCreationForm;
