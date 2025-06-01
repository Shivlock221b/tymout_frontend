import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaTags, FaImage, FaUser, FaBuilding } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';

/**
 * EventCreationFormHookForm Component
 * 
 * Modernized version of EventCreationForm using React Hook Form
 * Following Single Responsibility Principle: Handles only the UI and validation logic
 * Follows Interface Segregation Principle: Only accepts props it needs
 */

import PlaceSearch from './PlaceSearch';

const EventCreationFormHookForm = ({ defaultValues, onSubmit, locations, isSubmitting, selectedTemplate }) => {
  const user = useAuthStore(state => state.user);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [uploadError, setUploadError] = useState('');
  // Use host's profile image instead of uploading a new one
  const hostProfileImage = user?.profileImage || null;
  
  // State for AM/PM selection
  const [timeAmPm, setTimeAmPm] = useState('AM');
  
  // Format time from user input (HH:MM) and AM/PM to 24-hour format
  const formatTimeFor24Hour = (timeInput, ampm) => {
    if (!timeInput) return '';
    
    // If the time is already in 24-hour format, return it
    if (timeInput.includes(':') && timeInput.length === 5) {
      const [hours] = timeInput.split(':');
      const hoursInt = parseInt(hours, 10);
      
      // If valid 24-hour format, return it
      if (hoursInt >= 0 && hoursInt < 24) {
        return timeInput;
      }
    }
    
    // Parse the time input - accept different formats
    let hours = 0;
    let minutes = 0;
    
    // Handle different formats (8:30, 8.30, 830, 8)
    if (timeInput.includes(':')) {
      [hours, minutes] = timeInput.split(':').map(num => parseInt(num, 10));
    } else if (timeInput.includes('.')) {
      [hours, minutes] = timeInput.split('.').map(num => parseInt(num, 10));
    } else if (timeInput.length <= 2) {
      // If just hours provided (e.g., "8")
      hours = parseInt(timeInput, 10);
      minutes = 0;
    } else if (timeInput.length <= 4) {
      // If time provided without separator (e.g., "830")
      hours = parseInt(timeInput.substring(0, timeInput.length - 2), 10);
      minutes = parseInt(timeInput.substring(timeInput.length - 2), 10);
    }
    
    // Handle AM/PM conversion
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Format to HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue 
  } = useForm({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      date: '',
      time: '',
      city: '',
      place: null,
      duration: 60,
      maxAttendees: 10,
      isPublic: true,
      isRecurring: false,
      tags: [],
      category: 'Food'
    }
  });
  
  // Watch for changes
  const selectedCity = watch('city');
  
  // State for tag input
  const [tagInput, setTagInput] = useState('');
  
  // Handle tag input change
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  // Add a tag when the plus button is clicked
  const handleAddTag = (onChange, currentTags) => {
    if (!tagInput.trim()) return;
    
    // Format tag with first letter capitalized and rest lowercase
    const formattedTag = tagInput.trim().toLowerCase();
    const capitalizedTag = formattedTag.charAt(0).toUpperCase() + formattedTag.slice(1);
    
    // Convert current tags string to array if it's a string
    const currentTagsArray = typeof currentTags === 'string' 
      ? currentTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : Array.isArray(currentTags) ? currentTags : [];
    
    // Check if tag already exists (case-insensitive)
    const tagExists = currentTagsArray.some(tag => 
      tag.toLowerCase() === capitalizedTag.toLowerCase()
    );
    
    // Add the new tag if it's not already in the array
    if (!tagExists) {
      const updatedTags = [...currentTagsArray, capitalizedTag];
      
      // Update the form value with the comma-separated string
      onChange(updatedTags.join(', '));
      
      // Also store the array version
      setValue('tagsArray', updatedTags);
    }
    
    // Clear the input
    setTagInput('');
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove, onChange, currentTags) => {
    // Convert current tags string to array
    const currentTagsArray = typeof currentTags === 'string' 
      ? currentTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : Array.isArray(currentTags) ? currentTags : [];
    
    // Remove the tag
    const updatedTags = currentTagsArray.filter(tag => tag !== tagToRemove);
    
    // Update the form value
    onChange(updatedTags.join(', '));
    
    // Also update the array version
    setValue('tagsArray', updatedTags);
  };
  
  // No longer needed as we're using host's profile image instead
  // Kept commented for reference
  /*
  const handleImageChange = (e) => {
    console.log('[EventCreationForm] Image upload disabled - using host profile image instead');
    return;
  };
  
  const triggerFileInput = () => {
    console.log('[EventCreationForm] Image upload disabled - using host profile image instead');
  };
  */

  const processForm = async (data) => {
    try {
      // Transform form data to match backend schema
      const startDateTime = new Date(`${data.date}T${data.time}`);
      const endDateTime = new Date(startDateTime.getTime() + (data.duration || 60) * 60000);
      const eventData = {
        title: data.title,
        description: data.description,
        location: {
          type: 'physical', // For now, assuming physical; can extend for virtual
          city: data.city || '',
          onlineLink: ''
        },
        place: selectedPlace ? {
          placeId: selectedPlace.id,
          name: selectedPlace.name,
          address: selectedPlace.address,
          coordinates: selectedPlace.coordinates,
          category: selectedPlace.category.replace('_', ' '),  // Format Google category
          city: data.city
        } : null,
        date: {
          start: startDateTime,
          end: endDateTime
        },
        host: {
          userId: user && user.id ? user.id : '000000000000000000000000',
          name: user && user.name ? user.name : 'Test Host'
        },
        attendees: [],
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : data.tags,
        type: 'table',
        status: 'pending',
        maxAttendees: data.maxAttendees,
        entryFee: data.entryFee || 0,
        category: data.category,
        access: data.isPublic ? 'public' : 'private',
        isPublic: data.isPublic // Explicitly include the isPublic field
      };
      
      // Use host's profile image URL instead of uploaded image
      // This is the key change for the refactoring task
      if (hostProfileImage) {
        console.log('[EventCreationForm] Using host profile image:', hostProfileImage);
        // Use event_image field to match the database model schema
        eventData.event_image = hostProfileImage;
      } else {
        console.log('[EventCreationForm] No host profile image available');
      }
      
      // Pass null as imageFile since we're not uploading a separate image
      onSubmit(eventData, null);
    } catch (error) {
      console.error('Error processing form:', error);
      setUploadError('Error processing form. Please try again.');
    }
  };



  return (
    <div>
      {selectedTemplate && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Using template: {selectedTemplate.name}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(processForm)}>
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-base font-medium text-gray-700">
              Table Title*
            </label>
            <div className="mt-1">
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <input
                    type="text"
                    id="title"
                    className={`block w-full rounded-md shadow-sm sm:text-sm border border-black ${
                      errors.title 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-base font-medium text-gray-700">
              Description*
            </label>
            <div className="mt-1">
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <textarea
                    id="description"
                    rows="4"
                    className={`block w-full rounded-md shadow-sm sm:text-sm border border-black ${
                      errors.description
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...field}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Describe what your table is about and what participants can expect.
            </p>
            
            {/* Ready-made description suggestions */}
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Category-based descriptions:</p>
              <div className="flex flex-wrap gap-2">
                {/* Socialize description */}
                <button
                  type="button"
                  onClick={() => setValue('description', 'Join us for a social gathering at _______ where we can connect, share stories, and make new friends in a relaxed setting. Perfect for anyone looking to expand their social circle!')}
                  className="text-xs px-3 py-1.5 bg-fuchsia-50 text-fuchsia-700 rounded-full hover:bg-fuchsia-100 transition-colors"
                >
                  Socialize template
                </button>
                
                {/* Food description */}
                <button
                  type="button"
                  onClick={() => setValue('description', 'Let\'s enjoy delicious _______ cuisine together! This table is for food lovers who want to explore new flavors while making connections. All dietary preferences welcome!')}
                  className="text-xs px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full hover:bg-rose-100 transition-colors"
                >
                  Food template
                </button>
                
                {/* Play description */}
                <button
                  type="button"
                  onClick={() => setValue('description', 'Come join us for a fun _______ activity! Whether you\'re experienced or a beginner, this is a great opportunity to stay active and meet like-minded people. All skill levels welcome!')}
                  className="text-xs px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full hover:bg-violet-100 transition-colors"
                >
                  Play template
                </button>
                
                {/* Travel description */}
                <button
                  type="button"
                  onClick={() => setValue('description', 'Explore _______ with a group of fellow travelers! We\'ll discover hidden gems, share travel stories, and create memorable experiences together. Great for both locals and visitors!')}
                  className="text-xs px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full hover:bg-cyan-100 transition-colors"
                >
                  Travel template
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tip: Replace the blank spaces (______) with your specific details.</p>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Field */}
            <div>
              <label htmlFor="date" className="block text-base font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  Date*
                </span>
              </label>
              <div className="mt-1">
                <Controller
                  name="date"
                  control={control}
                  rules={{ 
                    required: 'Date is required',
                    validate: value => {
                      // Get today's date at midnight for comparison
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      // Parse the selected date
                      const selectedDate = new Date(value);
                      selectedDate.setHours(0, 0, 0, 0);
                      
                      // Check if the selected date is before today
                      return selectedDate >= today || 'Event date cannot be in the past';
                    }
                  }}
                  render={({ field }) => {
                    // Set min attribute to today's date
                    const today = new Date().toISOString().split('T')[0];
                    
                    return (
                      <input
                        type="date"
                        id="date"
                        min={today}
                        className={`block w-full rounded-md shadow-sm sm:text-sm border border-black ${
                          errors.date
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        {...field}
                      />
                    );
                  }}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Time Field */}
            <div>
              <label htmlFor="time" className="block text-base font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaClock className="mr-2 text-gray-400" />
                  Time*
                </span>
              </label>
              <div className="mt-1">
                <Controller
                  name="time"
                  control={control}
                  rules={{ 
                    required: 'Time is required',
                    validate: (value) => {
                      // Validate that the input is a valid time
                      if (!value) return 'Time is required';
                      
                      // The value should already be in 24-hour format from our handler
                      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                      return timeRegex.test(value) || 'Please enter a valid time';
                    }
                  }}
                  render={({ field: { onChange, value, ...fieldProps } }) => {
                    // Parse the 24-hour format time to display in 12-hour format
                    let displayTime = '';
                    let displayAmPm = timeAmPm;
                    
                    if (value) {
                      const [hours, minutes] = value.split(':');
                      const hoursInt = parseInt(hours, 10);
                      
                      // Determine AM/PM
                      if (hoursInt >= 12) {
                        displayAmPm = 'PM';
                        const displayHours = hoursInt === 12 ? 12 : hoursInt - 12;
                        displayTime = `${displayHours}:${minutes}`;
                      } else {
                        displayAmPm = 'AM';
                        const displayHours = hoursInt === 0 ? 12 : hoursInt;
                        displayTime = `${displayHours}:${minutes}`;
                      }
                      
                      // Update the AM/PM state
                      if (displayAmPm !== timeAmPm) {
                        setTimeAmPm(displayAmPm);
                      }
                    }
                                        // Extract hours and minutes for display
                     let selectedHours = '';
                     let selectedMinutes = '';
                     
                     if (displayTime) {
                       const [hours, minutes] = displayTime.split(':');
                       selectedHours = parseInt(hours, 10);
                       selectedMinutes = minutes;
                     }
                     
                     // Generate hours and minutes for selection
                     const hoursOptions = Array.from({ length: 12 }, (_, i) => i + 1);
                     const minutesOptions = ['00', '15', '30', '45'];
                     
                     return (
                      <div className="flex flex-wrap gap-2">
                        <div className="flex rounded-md">
                          {/* Hours Selector */}
                          <div className="relative">
                            <label htmlFor="timeHours" className="sr-only">Hours</label>
                            <select
                              id="timeHours"
                              className={`rounded-l-md pl-3 pr-8 py-2 border border-black text-sm ${errors.time 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                              value={selectedHours}
                              onChange={(e) => {
                                const hours = e.target.value;
                                const minutes = selectedMinutes || '00';
                                const time24 = formatTimeFor24Hour(`${hours}:${minutes}`, timeAmPm);
                                onChange(time24);
                              }}
                            >
                              <option value="">Hour</option>
                              {hoursOptions.map(hour => (
                                <option key={hour} value={hour}>{hour}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Minutes Selector */}
                          <div className="relative -ml-px">
                            <label htmlFor="timeMinutes" className="sr-only">Minutes</label>
                            <select
                              id="timeMinutes"
                              className={`pl-3 pr-8 py-2 border border-black text-sm ${errors.time 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                              value={selectedMinutes}
                              onChange={(e) => {
                                const hours = selectedHours || '12';
                                const minutes = e.target.value;
                                const time24 = formatTimeFor24Hour(`${hours}:${minutes}`, timeAmPm);
                                onChange(time24);
                              }}
                            >
                              <option value="">Min</option>
                              {minutesOptions.map(minute => (
                                <option key={minute} value={minute}>{minute}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* AM/PM Selector */}
                          <div className="-ml-px">
                            <select
                              id="timeAmPm"
                              className={`pl-2 pr-3 py-2 border border-black text-sm rounded-r-md ${errors.time 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                              value={timeAmPm}
                              onChange={(e) => {
                                const newAmPm = e.target.value;
                                setTimeAmPm(newAmPm);
                                if (selectedHours && selectedMinutes) {
                                  const time24 = formatTimeFor24Hour(`${selectedHours}:${selectedMinutes}`, newAmPm);
                                  onChange(time24);
                                }
                              }}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Duration & Max Attendees Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration Field */}
            <div>
              <label htmlFor="duration" className="block text-base font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaClock className="mr-2 text-gray-400" />
                  Duration (minutes)
                </span>
              </label>
              <div className="mt-1">
                <Controller
                  name="duration"
                  control={control}
                  rules={{ min: { value: 15, message: 'Duration must be at least 15 minutes' } }}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="duration"
                      min="15"
                      step="15"
                      placeholder="e.g., 60"
                      className="block w-full rounded-md border border-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      {...field}
                    />
                  )}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>
            </div>

            {/* Max Attendees Field */}
            <div>
              <label htmlFor="maxAttendees" className="block text-base font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaUsers className="mr-2 text-gray-400" />
                  Max Attendees (upto 10)
                </span>
              </label>
              <div className="mt-1">
                <Controller
                  name="maxAttendees"
                  control={control}
                  rules={{ 
                    min: { value: 1, message: 'At least 1 attendee is required' },
                    max: { value: 10, message: 'Maximum 10 attendees allowed' }
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="maxAttendees"
                      min="1"
                      max="10"
                      placeholder="Maximum 10"
                      className="block w-full rounded-md border border-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      {...field}
                    />
                  )}
                />
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* City Dropdown Field */}
          <div>
            <label htmlFor="city" className="block text-base font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaBuilding className="mr-2 text-gray-400" />
                City*
              </span>
            </label>
            <div className="mt-2">
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {/* Agra Tag */}
                    <button
                      type="button"
                      onClick={() => field.onChange('Agra')}
                      className={`px-2 py-1 rounded-full border flex items-center ${
                        field.value === 'Agra'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400'
                      }`}
                    >
                      <span className="mr-1 text-xs">🏙️</span>
                      <span className="font-medium text-xs">Agra</span>
                    </button>
                    
                    {/* Gurugram Tag */}
                    <button
                      type="button"
                      onClick={() => field.onChange('Gurugram')}
                      className={`px-2 py-1 rounded-full border flex items-center ${
                        field.value === 'Gurugram'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400'
                      }`}
                    >
                      <span className="mr-1 text-xs">🌆</span>
                      <span className="font-medium text-xs">Gurugram</span>
                    </button>
                  </div>
                )}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>
          
          {/* Place Search Field */}
          <div>
            <label htmlFor="place" className="block text-base font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                Place*
              </span>
            </label>
            <div className="mt-1">
              <Controller
                name="place"
                control={control}
                rules={{ 
                  validate: value => {
                    if (!selectedPlace) return 'Please select a place';
                    return true;
                  } 
                }}
                render={({ field }) => (
                  <PlaceSearch 
                    city={selectedCity}
                    onPlaceSelect={(place) => {
                      setSelectedPlace(place);
                      field.onChange(place ? place.name : '');
                    }}
                    error={errors.place?.message}
                  />
                )}
              />
            </div>
            {selectedPlace && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-700">{selectedPlace.name}</h4>
                <p className="text-sm text-gray-500">{selectedPlace.address}</p>
                {selectedPlace.category && (
                  <p className="text-xs text-gray-400 mt-1">Category: {selectedPlace.category}</p>
                )}
              </div>
            )}
          </div>

          {/* Category Field - Tag Style */}
          <div>
            <label className="block text-base font-medium text-gray-700">
              Category*
            </label>
            <div className="mt-2">
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {/* Food Tag */}
                    <button
                      type="button"
                      onClick={() => field.onChange('Food')}
                      className={`px-2 py-1 rounded-full border flex items-center ${
                        field.value === 'Food'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-rose-600 border-rose-200 hover:border-rose-400'
                      }`}
                    >
                      <span className="mr-1 text-xs">🍽️</span>
                      <span className="font-medium text-xs">Food</span>
                    </button>
                    
                    {/* Play Tag */}
                    <button
                      type="button"
                      onClick={() => field.onChange('Play')}
                      className={`px-2 py-1 rounded-full border flex items-center ${
                        field.value === 'Play'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-violet-600 border-violet-200 hover:border-violet-400'
                      }`}
                    >
                      <span className="mr-1 text-xs">👟</span>
                      <span className="font-medium text-xs">Play</span>
                    </button>
                    
                    {/* Socialize Tag */}
                    <button
                      type="button"
                      onClick={() => field.onChange('Socialize')}
                      className={`px-2 py-1 rounded-full border flex items-center ${
                        field.value === 'Socialize'
                          ? 'bg-fuchsia-600 text-white border-fuchsia-600'
                          : 'bg-white text-fuchsia-600 border-fuchsia-200 hover:border-fuchsia-400'
                      }`}
                    >
                      <span className="mr-1 text-xs">🎉</span>
                      <span className="font-medium text-xs">Socialize</span>
                    </button>
                    
                    {/* Travel Tag */}
                    <button
                      type="button"
                      onClick={() => field.onChange('Travel')}
                      className={`px-2 py-1 rounded-full border flex items-center ${
                        field.value === 'Travel'
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white text-cyan-600 border-cyan-200 hover:border-cyan-400'
                      }`}
                    >
                      <span className="mr-1 text-xs">✈️</span>
                      <span className="font-medium text-xs">Travel</span>
                    </button>
                  </div>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Capacity field removed - using maxAttendees instead */}

          {/* Host Profile Image Info */}
          <div>
            <label className="block text-base font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaImage className="mr-2 text-gray-400" />
                Event Image
              </span>
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex items-center">
                {hostProfileImage ? (
                  <div className="flex items-center">
                    <img
                      src={hostProfileImage}
                      alt="Host profile"
                      className="h-12 w-12 object-cover rounded-full mr-3"
                    />
                    <span className="text-sm text-gray-600">Your profile image will be used for this event</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <FaUser className="text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Your profile image will be used for this event</span>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              To change the event image, update your profile picture in settings
            </p>
          </div>
          
          {/* Tags Field */}
          <div>
            <label htmlFor="tags" className="block text-base font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaTags className="mr-2 text-gray-400" />
                Tags
              </span>
            </label>
            <div className="mt-1">
              <Controller
                name="tags"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>
                    {/* Tag input with plus button */}
                    <div className="flex mb-2">
                      <input
                        type="text"
                        id="tagInput"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        placeholder="Enter a tag (e.g., coffee)"
                        className="block w-full rounded-l-md border border-r-0 border-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(onChange, value);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(onChange, value)}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-black text-sm leading-4 font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Display added tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(typeof value === 'string' ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : value || []).map((tag, index) => (
                        <div key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag, onChange, value)}
                            className="ml-1 text-indigo-500 hover:text-indigo-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Add relevant tags to help people find your table
            </p>
          </div>

          {/* Table Type Toggle */}
          <div className="space-y-4">
            <label className="block text-base font-medium text-gray-700">Table Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Public */}
              <label className="flex items-start cursor-pointer">
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="radio"
                      id="publicTable"
                      checked={value === true}
                      onChange={() => onChange(true)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                  )}
                />
                <span className="ml-2">
                  <span className="font-medium text-gray-700">Public Table</span>
                  <p className="text-gray-500 text-sm">These tables will be visible on the Experience page after approval.</p>
                </span>
              </label>
              {/* Private */}
              <label className="flex items-start cursor-pointer">
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="radio"
                      id="privateTable"
                      checked={value === false}
                      onChange={() => onChange(false)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                  )}
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
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Table'}
          </button>
        </div>
      </form>
    </div>
  );
};

EventCreationFormHookForm.propTypes = {
  defaultValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    city: PropTypes.string,
    place: PropTypes.object,
    duration: PropTypes.number,
    maxAttendees: PropTypes.number,
    isPublic: PropTypes.bool,
    isRecurring: PropTypes.bool,
    tags: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  }),
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired
    })
  ),
  isSubmitting: PropTypes.bool,
  selectedTemplate: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })
};

EventCreationFormHookForm.defaultProps = {
  defaultValues: null,
  locations: [],
  isSubmitting: false,
  selectedTemplate: null
};

export default EventCreationFormHookForm;
