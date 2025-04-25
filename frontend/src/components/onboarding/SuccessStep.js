import React from 'react';

const SuccessStep = ({ profileData, onComplete, isLoading }) => {
  const calculateCompleteness = () => {
    const fields = ['name', 'bio', 'location', 'interests', 'profileImage'];
    let score = 0;
    const maxScore = 100;
    const pointsPerField = maxScore / fields.length;
    
    fields.forEach(field => {
      if (profileData[field] && (Array.isArray(profileData[field]) ? profileData[field].length > 0 : profileData[field])) {
        score += pointsPerField;
      }
    });
    
    return Math.min(Math.round(score), maxScore);
  };
  
  const completeness = calculateCompleteness();
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">You're all set!</h2>
        <p className="text-gray-600">Your profile is {completeness}% complete.</p>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-green-500 h-4 rounded-full" 
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Profile Summary</h3>
        
        <div className="space-y-3">
          <div className="flex">
            <div className="w-1/3 text-gray-500">Name:</div>
            <div className="w-2/3 font-medium">{profileData.name || 'Not provided'}</div>
          </div>
          
          {profileData.location && (
            <div className="flex">
              <div className="w-1/3 text-gray-500">Location:</div>
              <div className="w-2/3">{profileData.location}</div>
            </div>
          )}
          
          {profileData.bio && (
            <div className="flex">
              <div className="w-1/3 text-gray-500">Bio:</div>
              <div className="w-2/3">{profileData.bio}</div>
            </div>
          )}
          
          {profileData.interests && profileData.interests.length > 0 && (
            <div className="flex">
              <div className="w-1/3 text-gray-500">Interests:</div>
              <div className="w-2/3">
                <div className="flex flex-wrap gap-1">
                  {profileData.interests.map(interest => (
                    <span key={interest} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {profileData.profileImage && (
            <div className="flex items-center">
              <div className="w-1/3 text-gray-500">Profile Image:</div>
              <div className="w-2/3">
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Finishing...
            </span>
          ) : (
            'Start Exploring'
          )}
        </button>
      </div>
    </div>
  );
};

export default SuccessStep;
