import React from 'react';

// Single Responsibility Principle - this component only handles displaying profile avatar
const ProfileAvatar = ({ avatar, name, email, profileImage }) => {
  // Default avatar if none provided
  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
  
  // Get initials from name for fallback
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };

  return (
    <div className="flex items-center py-4 sm:py-5 sm:px-6 border-b border-gray-200">
      {/* Avatar image or fallback */}
      <div className="relative mr-4">
        {profileImage ? (
          <img
            src={profileImage}
            alt={`${name}'s profile`}
            className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : avatar ? (
          <img
            src={avatar}
            alt={`${name}'s profile`}
            className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 text-xl font-bold border-2 border-white shadow-sm">
            {getInitials(name)}
          </div>
        )}
        <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      
      {/* Name and status */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">{name || 'User'}</h2>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
    </div>
  );
};

export default ProfileAvatar;
