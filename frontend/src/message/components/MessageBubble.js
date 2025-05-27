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
const MessageBubble = ({ message, isOwn, avatar }) => {
  const content = message.content || message.text || '';
  const timestamp = message.timestamp || message.createdAt || new Date().toISOString();
  const status = message.status;
  
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
    <div className={`flex items-end mb-1 w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>  
      {/* Avatar for other user */}
      {!isOwn && avatar && (
        <img
          src={avatar || 'https://via.placeholder.com/32?text=U'}
          alt="User avatar"
          className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-50 mr-2"
          onError={(e)=>{e.target.onerror=null;e.target.src='https://via.placeholder.com/32?text=U';}}
        />
      )}
      
      <div className={`rounded-lg px-3 py-2 text-sm break-words whitespace-pre-line relative max-w-[80%] ${isOwn ? 'chat-bubble-glass-own bg-gray-200 text-gray-900' : 'chat-bubble-glass bg-white text-gray-900'}`}>
        {content}
        <div className={`flex items-center text-xs mt-1 text-gray-600`}>
          <span>{formattedTime}</span>
          {getStatusIcon() && <span className="ml-1">{getStatusIcon()}</span>}
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string,
    text: PropTypes.string,
    timestamp: PropTypes.string,
    createdAt: PropTypes.string,
    senderId: PropTypes.string,
    status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'read'])
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  avatar: PropTypes.string
};

export default MessageBubble;
