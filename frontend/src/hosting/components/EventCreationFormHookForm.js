import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaTags, FaImage, FaUpload, FaBuilding } from 'react-icons/fa';

/**
 * EventCreationFormHookForm Component
 * 
 * Modernized version of EventCreationForm using React Hook Form
 * Following Single Responsibility Principle: Handles only the UI and validation logic
 * Follows Interface Segregation Principle: Only accepts props it needs
 */
import { useAuthStore } from '../../stores/authStore';
import PlaceSearch from './PlaceSearch';

const EventCreationFormHookForm = ({ defaultValues, onSubmit, locations, isSubmitting, selectedTemplate }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const fileInputRef = useRef(null);
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
  const isRecurring = watch('isRecurring');
  const selectedCity = watch('city');
  
  // Handle tags input (comma-separated)
  const handleTagsChange = (e, onChange) => {
    const tagText = e.target.value;
    onChange(tagText); // Update the form input value
    
    // Convert comma-separated text to array for actual submission
    const tagsArray = tagText.split(',').map(tag => tag.trim()).filter(tag => tag);
    setValue('tagsArray', tagsArray);
  };
  
  const user = useAuthStore(state => state.user);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('[EventCreationForm] Selected file:', file ? { name: file.name, type: file.type, size: file.size } : 'No file');
    
    if (!file) {
      console.log('[EventCreationForm] No file selected');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    console.log('[EventCreationForm] File type validation:', { fileType: file.type, isValid: validTypes.includes(file.type) });
    
    if (!validTypes.includes(file.type)) {
      console.log('[EventCreationForm] Invalid file type rejected');
      setUploadError('Please select a valid image file (JPEG, PNG)');
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    console.log('[EventCreationForm] File size validation:', { fileSize: file.size, maxSize, isValid: file.size <= maxSize });
    
    if (file.size > maxSize) {
      console.log('[EventCreationForm] File too large rejected');
      setUploadError('Image size should be less than 5MB');
      return;
    }
    
    console.log('[EventCreationForm] File passed all validations, setting as imageFile');
    setUploadError('');
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('[EventCreationForm] Image preview created');
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

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
      
      // Include the image file if one was selected
      if (imageFile) {
        eventData.eventImage = imageFile;
      }
      
      onSubmit(eventData, imageFile);
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Event Title*
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
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.title 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.description
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
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
              Describe what your event is about and what participants can expect.
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
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <input
                      type="date"
                      id="date"
                      className={`block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.date
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      {...field}
                    />
                  )}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
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
                <Controller
                  name="time"
                  control={control}
                  rules={{ required: 'Time is required' }}
                  render={({ field }) => (
                    <input
                      type="time"
                      id="time"
                      className={`block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.time
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      {...field}
                    />
                  )}
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
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                <span className="inline-flex items-center">
                  <FaUsers className="mr-2 text-gray-400" />
                  Max Attendees
                </span>
              </label>
              <div className="mt-1">
                <Controller
                  name="maxAttendees"
                  control={control}
                  rules={{ min: { value: 1, message: 'At least 1 attendee is required' } }}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="maxAttendees"
                      min="1"
                      placeholder="e.g., 10"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaBuilding className="mr-2 text-gray-400" />
                City*
              </span>
            </label>
            <div className="mt-1">
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <select
                    id="city"
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.city
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...field}
                  >
                    <option value="">Select a city</option>
                    <option value="Agra">Agra</option>
                    <option value="Gurugram">Gurugram</option>
                  </select>
                )}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>
          
          {/* Place Search Field */}
          <div>
            <label htmlFor="place" className="block text-sm font-medium text-gray-700">
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

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category*
            </label>
            <div className="mt-1">
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <select
                    id="category"
                    className={`block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.category
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    {...field}
                  >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Play">Play</option>
                    <option value="Create">Create</option>
                    <option value="Learn">Learn</option>
                    <option value="Serve">Serve</option>
                    <option value="Socialize">Socialize</option>
                    <option value="Networking">Networking</option>
                    <option value="Games">Games</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Culture">Culture</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Capacity field removed - using maxAttendees instead */}

          {/* Event Image Upload */}
          <div>
            <label htmlFor="eventImage" className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaImage className="mr-2 text-gray-400" />
                Event Image
              </span>
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                id="eventImage"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaUpload className="-ml-1 mr-2 h-4 w-4" />
                Upload Image
              </button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {uploadError && (
              <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Upload an image for your event (JPEG, PNG, max 5MB)
            </p>
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
              <Controller
                name="tags"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <input
                    type="text"
                    id="tags"
                    value={value}
                    onChange={(e) => handleTagsChange(e, onChange)}
                    placeholder="e.g., coffee, networking, casual"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                )}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Add relevant tags to help people find your event
            </p>
          </div>

          {/* Visibility Options */}
          <div className="space-y-3">
            <div className="flex items-start">
              <Controller
                name="isPublic"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center h-5">
                    <input
                      id="isPublic"
                      type="checkbox"
                      checked={value}
                      onChange={onChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                )}
              />
              <div className="ml-3 text-sm">
                <label htmlFor="isPublic" className="font-medium text-gray-700">
                  Public Event
                </label>
                <p className="text-gray-500">Make this event visible to everyone</p>
              </div>
            </div>
            
            {/* Recurring event option commented out for now
            <div className="flex items-start">
              <Controller
                name="isRecurring"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center h-5">
                    <input
                      id="isRecurring"
                      type="checkbox"
                      checked={value}
                      onChange={onChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                )}
              />
              <div className="ml-3 text-sm">
                <label htmlFor="isRecurring" className="font-medium text-gray-700">
                  Recurring Event
                </label>
                <p className="text-gray-500">This event repeats on a schedule</p>
              </div>
            </div>
            */}
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
            {isSubmitting ? 'Creating...' : 'Create Event'}
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
