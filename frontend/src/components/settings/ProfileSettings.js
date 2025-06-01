import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileSettings, useUploadProfileImage, useRemoveProfileImage } from '../../hooks/queries/useSettingsQueries';

// List of available cities - same as in onboarding
const CITIES = ["Agra", "Gurugram"];

// Single Responsibility Principle - this component only handles profile settings
const ProfileSettings = ({ user }) => {
  const navigate = useNavigate();
  const removeProfileImage = useRemoveProfileImage();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    interests: [],
    profileImage: ''
  });
  const [availableInterests, setAvailableInterests] = useState([
    'hiking', 'photography', 'cooking', 'reading', 'travel', 'music', 
    'movies', 'art', 'sports', 'technology', 'gaming', 'fitness', 
    'yoga', 'meditation', 'dancing', 'writing', 'fashion', 'food'
  ]);
  const [newInterest, setNewInterest] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Use React Query mutations for saving settings and uploading images
  const updateProfile = useUpdateProfileSettings();
  const uploadProfileImage = useUploadProfileImage();

  // Add a timestamp to force image refresh
  const addCacheBuster = (url) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${new Date().getTime()}`;
  };

  useEffect(() => {
    // Update form data whenever user data changes
    if (user) {
      console.log('User data changed, updating form data:', user);
      // Add cache buster to profile image URL to force refresh
      const profileImageWithCacheBuster = addCacheBuster(user.profileImage);
      console.log('Using profile image with cache buster:', profileImageWithCacheBuster);
      
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: user.interests || [],
        profileImage: profileImageWithCacheBuster
      });
    }
  }, [user]); // This dependency array ensures the effect runs when user changes
  
  // Force a refresh of the component when mounted
  useEffect(() => {
    // Force a refresh of the auth store data
    const refreshData = async () => {
      try {
        // Force a refresh of the user data
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          if (parsed.state && parsed.state.user && parsed.state.user.profileImage) {
            // Add cache buster to force browser to reload the image
            const profileImageWithCacheBuster = addCacheBuster(parsed.state.user.profileImage);
            console.log('Refreshing profile image with:', profileImageWithCacheBuster);
            
            // Update form data with the refreshed image URL
            setFormData(prevData => ({
              ...prevData,
              profileImage: profileImageWithCacheBuster
            }));
          }
        }
      } catch (e) {
        console.error('Error refreshing data:', e);
      }
    };
    
    refreshData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = e.target.files[0];
      if (file) {
        // Upload the file to the server
        handleImageUpload(file);
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (file) => {
    console.log('Handling image upload for file:', file.name);
    
    // Show preview immediately for better UX
    const imageUrl = URL.createObjectURL(file);
    setFormData(prevData => ({
      ...prevData,
      profileImage: imageUrl
    }));
    
    // Upload to server
    uploadProfileImage.mutate(file, {
      onSuccess: (data) => {
        console.log('Image upload success, received data:', data);
        
        // Get the profile image URL from the response
        const newProfileImageUrl = data.profileImage || data.user?.profileImage;
        
        if (newProfileImageUrl) {
          // Add cache buster to force browser to reload the image
          const profileImageWithCacheBuster = addCacheBuster(newProfileImageUrl);
          
          console.log('Setting new profile image with cache buster:', profileImageWithCacheBuster);
          
          // Update form data with the real URL from the server
          setFormData(prevData => ({
            ...prevData,
            profileImage: profileImageWithCacheBuster
          }));
          
          // Force update the image in localStorage as well
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const parsed = JSON.parse(authStorage);
              if (parsed.state && parsed.state.user) {
                parsed.state.user.profileImage = newProfileImageUrl;
                localStorage.setItem('auth-storage', JSON.stringify(parsed));
                console.log('Directly updated profile image in localStorage');
              }
            }
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
        }
        
        setSuccessMessage('Profile image uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        console.error('Error uploading profile image:', error);
        // Revert to previous state if upload fails
        setFormData(prevData => ({
          ...prevData,
          profileImage: user?.profileImage || ''
        }));
      }
    });
  };

  const addInterest = () => {
    if (newInterest && !formData.interests.includes(newInterest)) {
      setFormData(prevData => ({
        ...prevData,
        interests: [...prevData.interests, newInterest]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setFormData(prevData => ({
      ...prevData,
      interests: prevData.interests.filter(item => item !== interest)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the form data being submitted
    console.log('Submitting profile data:', formData);
    
    // Ensure we're sending the right fields in the correct format
    const profileDataToSubmit = {
      name: formData.name,
      bio: formData.bio,
      location: formData.location,
      interests: formData.interests
      // Don't include profileImage as it's handled separately
    };
    
    console.log('Formatted profile data for submission:', profileDataToSubmit);
    
    // Use React Query mutation to save settings
    updateProfile.mutate(profileDataToSubmit, {
      onSuccess: (data) => {
        // Log the successful response
        console.log('Profile update successful, response:', data);
        
        // Update form data with the returned data to ensure it's in sync
        setFormData(prevData => ({
          ...prevData,
          ...data
        }));
        
        // Show success message
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        console.error('Error updating profile:', error);
        setSuccessMessage(`Error: ${error.message || 'Failed to update profile'}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-x-hidden">
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Profile Image */}
        <div>
          {/* <h3 className="text-lg font-medium text-gray-900">Profile Image</h3> */}
          <p className="mt-1 text-sm text-gray-500">Upload a profile picture to personalize your account.</p>
          
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative">
              <div className="mt-1 flex items-center">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                    key={`profile-img-${new Date().getTime()}`} // Force re-render of image
                  />
                ) : (
                  <span className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label 
                htmlFor="profile-image" 
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${uploadProfileImage.isPending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} focus:outline-none`}
              >
                {uploadProfileImage.isPending ? 'Uploading...' : 'Upload Image'}
                <input 
                  id="profile-image" 
                  name="profileImage" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleChange}
                  disabled={uploadProfileImage.isPending}
                  className="sr-only"
                />
              </label>

              <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </div>
        
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 text-sm text-gray-500">Update your basic profile information.</p>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-2 sm:gap-x-4 sm:grid-cols-6">
            <div className="col-span-1 sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="col-span-1 sm:col-span-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Tell us about yourself"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Brief description for your profile.</p>
            </div>

            <div className="col-span-1 sm:col-span-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1">
                <select
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="" disabled>Select your city</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500">Your current city helps us show relevant events.</p>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Interests</h3>
          <p className="mt-1 text-sm text-gray-500">Select interests to help us find matches for you.</p>
          
          <div className="mt-2 max-w-full overflow-hidden">
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.interests.map((interest, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row">
              <div className="flex-grow mb-2 sm:mb-0">
                <select
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select an interest</option>
                  {availableInterests
                    .filter(interest => !formData.interests.includes(interest))
                    .map((interest, index) => (
                      <option key={index} value={interest}>
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addInterest}
                className="sm:ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              // Force navigation to profile page
              console.log('Cancel button clicked, navigating to /profile');
              // Use replace instead of push to avoid navigation history issues
              navigate('/profile', { replace: true });
            }}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${updateProfile.isPending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileSettings;
