import React, { useState } from 'react';

const INTEREST_OPTIONS = [
  'Food & Dining', 'Coffee', 'Networking', 'Business', 'Technology', 
  'Art & Culture', 'Music', 'Sports', 'Fitness', 'Outdoors', 
  'Books', 'Movies', 'Gaming', 'Travel', 'Photography',
  'Fashion', 'Education', 'Science', 'Health & Wellness', 'Spirituality'
];

const InterestsStep = ({ initialInterests = [], onComplete, onSkip, isLoading }) => {
  const [selectedInterests, setSelectedInterests] = useState(initialInterests);
  const [customInterest, setCustomInterest] = useState('');
  const [error, setError] = useState('');
  
  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(item => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
    
    if (error) setError('');
  };
  
  const handleAddCustomInterest = () => {
    if (!customInterest.trim()) return;
    
    if (customInterest.length > 20) {
      setError('Interest cannot exceed 20 characters');
      return;
    }
    
    if (selectedInterests.includes(customInterest.trim())) {
      setError('This interest is already added');
      return;
    }
    
    setSelectedInterests(prev => [...prev, customInterest.trim()]);
    setCustomInterest('');
    setError('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    
    onComplete({ interests: selectedInterests });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">What are you interested in?</h2>
      <p className="text-gray-600 mb-6">Select interests to help us connect you with like-minded people and events.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-500'
                    : 'bg-gray-100 text-gray-800 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Add custom interest"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleAddCustomInterest}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Add
            </button>
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {selectedInterests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your selected interests:</p>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map(interest => (
                  <div 
                    key={interest} 
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className="ml-1.5 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            disabled={isLoading}
          >
            Skip for now
          </button>
          
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

export default InterestsStep;
