import React, { useState } from 'react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const SocialMediaStep = ({ initialData = {}, onComplete, isLoading }) => {
  const [formData, setFormData] = useState({
    instagram: initialData.instagram || '',
    twitter: initialData.twitter || '',
    linkedin: initialData.linkedin || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.instagram && !formData.twitter && !formData.linkedin) {
      setError("Please provide at least one social media username to continue.");
      return;
    }
    setError("");
    const socialData = {
      social: {
        instagram: formData.instagram,
        twitter: formData.twitter,
        linkedin: formData.linkedin
      }
    };
    onComplete(socialData);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Connect Your Social Media</h2>
      <p className="text-gray-600 mb-6">Add your social media usernames to connect with others (optional)</p>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
        )}
        <div className="space-y-4">
          {/* Instagram */}
          <div className="flex items-center">
            <FaInstagram className="text-pink-600 h-5 w-5 mr-3" />
            <div className="flex-grow">
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                Instagram Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="instagram"
                  id="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="username (without @)"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Twitter */}
          <div className="flex items-center">
            <FaTwitter className="text-blue-400 h-5 w-5 mr-3" />
            <div className="flex-grow">
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                Twitter Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="twitter"
                  id="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="username (without @)"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* LinkedIn */}
          <div className="flex items-center">
            <FaLinkedin className="text-blue-700 h-5 w-5 mr-3" />
            <div className="flex-grow">
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                LinkedIn Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="linkedin"
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="username"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <span></span>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocialMediaStep;
