import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

/**
 * MessageBubble Component
 * 
 * Following Single Responsibility Principle:
 * - Only responsible for displaying a single message bubble
 * - Handles different states (own/received messages) and status indicators
 */
const MessageBubble = ({ message, isOwn }) => {
  const { content, timestamp, status } = message;
  
  // Format the timestamp to relative time
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  // Get status icon based on message status (only for own messages)
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (status) {
      case 'sending':
        return null; // No icon for sending
      case 'sent':
        return <FaCheck className="text-gray-400" />;
      case 'delivered':
        return <FaCheckDouble className="text-gray-400" />;
      case 'read':
        return <FaCheckDouble className="text-indigo-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative px-4 py-2 rounded-xl max-w-xs md:max-w-md break-words
          ${isOwn ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}
        `}
      >
        {content}
        
        <div className={`
          flex items-center text-xs mt-1
          ${isOwn ? 'text-indigo-200' : 'text-gray-500'}
        `}>
          <span>{formattedTime}</span>
          {getStatusIcon() && (
            <span className="ml-1">
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'read'])
  }).isRequired,
  isOwn: PropTypes.bool.isRequired
};

export default MessageBubble;
