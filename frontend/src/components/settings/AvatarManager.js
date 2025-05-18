import React, { useState, useRef } from 'react';

// Single Responsibility Principle - this component only handles avatar management
const AvatarManager = ({ user }) => {
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [croppingActive, setCroppingActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Mock profiles image for demonstration
  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setCroppingActive(true);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  const handleSaveCrop = () => {
    // In a real application, send cropped image to server
    setUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAvatar(previewImage);
      setCroppingActive(false);
      setUploading(false);
      setSuccessMessage('Avatar updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };
  
  const handleCancelCrop = () => {
    setPreviewImage(null);
    setCroppingActive(false);
  };
  
  const handleRemoveAvatar = () => {
    setUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAvatar(null);
      setUploading(false);
      setSuccessMessage('Avatar removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
      <p className="mt-1 text-sm text-gray-500">Update your profile picture.</p>
      
      {successMessage && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="mt-6">
        {croppingActive ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Adjust your photo</h4>
            <div className="flex justify-center">
              <div className="relative w-64 h-64 border border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-2 ring-indigo-600 ring-opacity-50 rounded-lg pointer-events-none"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              This is a simplified preview. In a real application, you would be able to drag to reposition and use the slider below to zoom.
            </p>
            <div className="flex justify-center">
              <input
                type="range"
                min="1"
                max="100"
                className="w-full max-w-xs"
                defaultValue="50"
                aria-label="Zoom level"
              />
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {uploading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <img 
                className="h-24 w-24 rounded-full border border-gray-300 object-cover"
                src={avatar || defaultAvatar} 
                alt="User avatar" 
              />
              {uploading && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            <div className="ml-5">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="block text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarManager;
