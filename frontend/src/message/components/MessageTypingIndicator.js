import React from 'react';

/**
 * MessageTypingIndicator Component
 * 
 * Following Single Responsibility Principle:
 * - Only responsible for displaying the typing indicator animation
 */
const MessageTypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl">
        <div className="flex space-x-1">
          <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0ms' }}></div>
          <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '200ms' }}></div>
          <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MessageTypingIndicator;
