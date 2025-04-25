import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';

/**
 * RecurringEventScheduler Component
 *
 * Single Responsibility: Manages the UI for setting up recurring event schedules
 * Interface Segregation: Only accepts props it needs
 */
const RecurringEventScheduler = ({ eventData, onEventDataChange, onSubmit }) => {
  const [errors, setErrors] = useState({});
  
  // Days of the week for the weekly pattern
  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];
  
  // Handle changes to recurring pattern properties
  const handlePatternChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user changes it
    if (errors[`pattern.${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`pattern.${name}`];
        return newErrors;
      });
    }
    
    onEventDataChange({
      recurringPattern: {
        ...eventData.recurringPattern,
        [name]: value
      }
    });
  };
  
  // Handle changes to pattern interval (numeric value)
  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    
    onEventDataChange({
      recurringPattern: {
        ...eventData.recurringPattern,
        interval: value
      }
    });
  };
  
  // Toggle day selection for weekly recurring events
  const toggleDayOfWeek = (day) => {
    const currentDays = eventData.recurringPattern.daysOfWeek || [];
    let newDays;
    
    if (currentDays.includes(day)) {
      newDays = currentDays.filter(d => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    
    onEventDataChange({
      recurringPattern: {
        ...eventData.recurringPattern,
        daysOfWeek: newDays
      }
    });
    
    // Clear error if at least one day is selected
    if (newDays.length > 0 && errors['pattern.daysOfWeek']) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['pattern.daysOfWeek'];
        return newErrors;
      });
    }
  };
  
  // Function to validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Basic event data validations
    if (!eventData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!eventData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!eventData.location) {
      newErrors.location = 'Location is required';
    }
    
    // Recurring pattern validations
    if (!eventData.recurringPattern.endDate) {
      newErrors['pattern.endDate'] = 'End date is required';
    }
    
    // If weekly recurrence, at least one day must be selected
    if (
      eventData.recurringPattern.frequency === 'weekly' && 
      (!eventData.recurringPattern.daysOfWeek || eventData.recurringPattern.daysOfWeek.length === 0)
    ) {
      newErrors['pattern.daysOfWeek'] = 'At least one day of the week must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(e);
    }
  };
  
  // Generate a human-readable description of the recurring pattern
  const getPatternDescription = () => {
    const { frequency, interval, daysOfWeek = [] } = eventData.recurringPattern;
    
    let description = 'Repeats ';
    
    if (frequency === 'daily') {
      description += interval === 1 ? 'daily' : `every ${interval} days`;
    } else if (frequency === 'weekly') {
      if (daysOfWeek.length === 0) {
        description += interval === 1 ? 'weekly' : `every ${interval} weeks`;
      } else if (daysOfWeek.length === 7) {
        description += 'every day';
      } else {
        description += interval === 1 ? 'weekly on ' : `every ${interval} weeks on `;
        description += daysOfWeek
          .sort((a, b) => {
            const order = { 'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6 };
            return order[a] - order[b];
          })
          .map(day => day.charAt(0).toUpperCase() + day.slice(1))
          .join(', ');
      }
    } else if (frequency === 'monthly') {
      description += interval === 1 ? 'monthly' : `every ${interval} months`;
    }
    
    if (eventData.recurringPattern.endDate) {
      description += ` until ${new Date(eventData.recurringPattern.endDate).toLocaleDateString()}`;
    }
    
    return description;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Set Up Recurring Event</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create events that repeat on a regular schedule
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="recurring-title" className="block text-sm font-medium text-gray-700">
              Event Title*
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="recurring-title"
                name="title"
                value={eventData.title}
                onChange={(e) => onEventDataChange({ title: e.target.value })}
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
            <label htmlFor="recurring-description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <div className="mt-1">
              <textarea
                id="recurring-description"
                name="description"
                rows="3"
                value={eventData.description}
                onChange={(e) => onEventDataChange({ description: e.target.value })}
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
          </div>

          {/* Location Field */}
          <div>
            <label htmlFor="recurring-location" className="block text-sm font-medium text-gray-700">
              Location*
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="recurring-location"
                name="location"
                value={eventData.location}
                onChange={(e) => onEventDataChange({ location: e.target.value })}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.location 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>
          
          {/* Recurring Pattern Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaSyncAlt className="mr-2 text-indigo-500" />
              Recurrence Pattern
            </h3>
            
            {/* Pattern Summary */}
            <div className="mt-2 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
              {getPatternDescription()}
            </div>
            
            {/* Frequency Selection */}
            <div className="mt-4">
              <label htmlFor="pattern-frequency" className="block text-sm font-medium text-gray-700">
                Repeats
              </label>
              <select
                id="pattern-frequency"
                name="frequency"
                value={eventData.recurringPattern.frequency}
                onChange={handlePatternChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            {/* Interval Selection */}
            <div className="mt-4">
              <label htmlFor="pattern-interval" className="block text-sm font-medium text-gray-700">
                Repeat every
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="number"
                  id="pattern-interval"
                  name="interval"
                  min="1"
                  max="30"
                  value={eventData.recurringPattern.interval}
                  onChange={handleIntervalChange}
                  className="max-w-xs block rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <span className="ml-2 text-sm text-gray-500">
                  {eventData.recurringPattern.frequency === 'daily' && 'day(s)'}
                  {eventData.recurringPattern.frequency === 'weekly' && 'week(s)'}
                  {eventData.recurringPattern.frequency === 'monthly' && 'month(s)'}
                </span>
              </div>
            </div>
            
            {/* Days of Week Selection (for weekly frequency) */}
            {eventData.recurringPattern.frequency === 'weekly' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  On which days
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                        eventData.recurringPattern.daysOfWeek?.includes(day.value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {errors['pattern.daysOfWeek'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['pattern.daysOfWeek']}</p>
                )}
              </div>
            )}
            
            {/* End Date */}
            <div className="mt-4">
              <label htmlFor="pattern-end-date" className="block text-sm font-medium text-gray-700">
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  End Date*
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="pattern-end-date"
                  name="endDate"
                  value={eventData.recurringPattern.endDate}
                  onChange={handlePatternChange}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    errors['pattern.endDate']
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors['pattern.endDate'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['pattern.endDate']}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Notice section */}
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Recurring Event Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This will create multiple events based on your recurrence pattern. Be sure you have the
                    availability for all occurrences. You can edit individual occurrences later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Recurring Event
          </button>
        </div>
      </form>
    </div>
  );
};

RecurringEventScheduler.propTypes = {
  eventData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string,
    recurringPattern: PropTypes.shape({
      frequency: PropTypes.oneOf(['daily', 'weekly', 'monthly']),
      interval: PropTypes.number,
      endDate: PropTypes.string,
      daysOfWeek: PropTypes.arrayOf(PropTypes.string)
    })
  }).isRequired,
  onEventDataChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default RecurringEventScheduler;
