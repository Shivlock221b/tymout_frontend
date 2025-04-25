import React from 'react';

// Single Responsibility Principle - this component only handles displaying user interests
const UserInterests = ({ interests = [] }) => {
  return (
    <div className="py-4 sm:py-5 sm:px-6">
      <dt className="text-sm font-medium text-gray-500 mb-2">Interests</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {interests.length === 0 ? (
          <p className="text-gray-500 italic">No interests added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </dd>
    </div>
  );
};

export default UserInterests;
