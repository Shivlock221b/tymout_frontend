import React from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isYesterday } from 'date-fns';

/**
 * MessageItem Component
 * 
 * Following Single Responsibility Principle:
 * - This component is only responsible for rendering a single message thread item
 * - It displays the user avatar, name, last message, timestamp, and unread count
 */
const MessageItem = ({ thread, onClick }) => {
  const { name, avatar, lastMessage, timestamp, unread, online, tags } = thread;
  
  // Format the timestamp
  const messageDate = new Date(timestamp);
  let formattedTime;
  
  if (isToday(messageDate)) {
    formattedTime = format(messageDate, 'h:mm a');
  } else if (isYesterday(messageDate)) {
    formattedTime = 'Yesterday';
  } else {
    formattedTime = format(messageDate, 'MMM d');
  }
  
  // Get tag styling
  const getTagStyle = (tag) => {
    const styles = {
      Events: 'bg-blue-50 text-blue-700 border-blue-200',
      Circle: 'bg-amber-50 text-amber-700 border-amber-200',
      Private: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    
    return styles[tag] || 'bg-gray-50 text-gray-700 border-gray-200';
  };
  
  // Get the tag (should be a single tag now)
  const tag = tags && tags.length > 0 ? tags[0] : null;
  
  return (
    <div 
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar with online indicator */}
        <div className="relative">
          <img 
            src={avatar} 
            alt={`${name}'s avatar`}
            className="w-12 h-12 rounded-full object-cover"
          />
          {online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-gray-900 truncate">{name}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formattedTime}</span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-1 mb-1">{lastMessage}</p>
          
          {/* Tag (single) */}
          {tag && (
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium border ${getTagStyle(tag)}`}>
              {tag}
            </span>
          )}
        </div>
        
        {/* Unread count */}
        {unread > 0 && (
          <div className="ml-2 mt-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
              {unread}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    lastMessage: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    unread: PropTypes.number,
    online: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default MessageItem;
