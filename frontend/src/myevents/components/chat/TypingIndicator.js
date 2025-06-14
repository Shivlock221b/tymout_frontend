import React from 'react';

/**
 * Displays a modern typing indicator when users are typing in the chat
 * @param {Object} props Component props
 * @param {Array} props.typingUsers Array of users who are currently typing
 * @param {string} props.currentUserId ID of the current user to exclude from the typing list
 */
const TypingIndicator = ({ typingUsers, currentUserId }) => {
  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(user => user.id !== currentUserId);
  
  if (otherTypingUsers.length === 0) {
    return null;
  }

  // Format typing message based on number of users
  const formatTypingMessage = () => {
    if (otherTypingUsers.length === 1) {
      return (
        <span className="text-gray-600">
          <span className="font-medium text-indigo-600">{otherTypingUsers[0].name}</span> is typing
        </span>
      );
    } else if (otherTypingUsers.length === 2) {
      return (
        <span className="text-gray-600">
          <span className="font-medium text-indigo-600">{otherTypingUsers[0].name}</span> and{' '}
          <span className="font-medium text-indigo-600">{otherTypingUsers[1].name}</span> are typing
        </span>
      );
    } else {
      return (
        <span className="text-gray-600">
          <span className="font-medium text-indigo-600">{otherTypingUsers.length} people</span> are typing
        </span>
      );
    }
  };

  return (
    <div className="flex items-center px-4 py-2 text-sm bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-slate-200 rounded-full transition-all duration-300 ease-in-out shadow-glass">
      <div className="typing-indicator mr-2">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {formatTypingMessage()}
    </div>
  );
};

export default TypingIndicator;
