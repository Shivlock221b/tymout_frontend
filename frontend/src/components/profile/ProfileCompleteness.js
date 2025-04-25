import React from 'react';

// Single Responsibility Principle - this component only handles displaying profile completeness
const ProfileCompleteness = ({ completeness = 0 }) => {
  return (
    <div className="bg-gray-50 px-4 py-3 sm:px-6">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-500">Profile Completeness</span>
          <span className="text-sm font-medium text-gray-700">{completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
        {completeness < 100 && (
          <p className="text-xs text-gray-500 mt-1">
            Complete your profile to get more matches!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileCompleteness;
