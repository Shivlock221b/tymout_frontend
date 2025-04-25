import React from 'react';

// Single Responsibility Principle - this component only handles displaying user details
const UserDetails = ({ bio, location }) => {
  return (
    <dl className="divide-y divide-gray-200">
      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Location</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{location || 'Not specified'}</dd>
      </div>
      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Bio</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bio || 'No bio added yet'}</dd>
      </div>
    </dl>
  );
};

export default UserDetails;
