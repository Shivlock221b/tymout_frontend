import React from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isYesterday } from 'date-fns';

// Styling helper for unread badge / avatar online indicator can be enhanced later
const ChatListItem = ({ chat, onClick, currentUserId }) => {
  if (!chat) return null;
  const { otherUser, lastMessage, unreadCount } = chat;

  // Friendly time label
  let timeLabel = '';
  if (lastMessage?.timestamp) {
    const dt = new Date(lastMessage.timestamp);
    if (isToday(dt)) timeLabel = format(dt, 'HH:mm');
    else if (isYesterday(dt)) timeLabel = 'Yesterday';
    else timeLabel = format(dt, 'MMM d');
  }

  return (
    <div
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative">
          <img
            src={otherUser.avatar || '/avatar-placeholder.png'}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {/* TODO: online indicator when presence is implemented */}
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className="font-medium text-gray-900 truncate">{otherUser.name}</h3>
            {timeLabel && (
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{timeLabel}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-1">
            {lastMessage?.isDeleted
              ? 'This message was deleted'
              : lastMessage?.text || 'No messages yet'}
          </p>
        </div>

        {/* Unread */}
        {unreadCount > 0 && (
          <div className="ml-2 mt-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
              {unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

ChatListItem.propTypes = {
  chat: PropTypes.shape({
    chatId: PropTypes.string.isRequired,
    otherUser: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string
    }).isRequired,
    lastMessage: PropTypes.shape({
      text: PropTypes.string,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    }),
    unreadCount: PropTypes.number
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  currentUserId: PropTypes.string
};

export default ChatListItem;
