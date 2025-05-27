import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCircle, FaUser } from 'react-icons/fa';

// PersonalChatCard – displays a single one-on-one chat preview card in MyEvents "Personal" tab.
// Only global CSS utility classes are used as per project guidelines.
// Props expected: { chat: { id, name, avatar, lastMessage, timestamp, unread, online } }

const PersonalChatCard = ({ chat }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    navigate(`/messages/${chat.id}`);
  };

  // Format timestamp to relative time (HH:MM or Date)
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full flex flex-col px-0 py-2">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyPress={e => { if (e.key === 'Enter') handleClick(); }}
      >
        <div className="relative w-14 h-14">
          {chat.avatar && !imgError ? (
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-full h-full rounded object-cover border border-gray-200 bg-gray-50 object-center"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full rounded flex items-center justify-center bg-gray-100 border border-gray-200">
              <FaUser className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {chat.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg z-10">
              {chat.unread}
            </span>
          )}
          {chat.online && (
            <FaCircle className="absolute bottom-0 right-0 w-3 h-3 text-emerald-500 bg-white rounded-full" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-base text-primary mb-0.5">{chat.name}</div>
            <span className="text-xs text-gray-400">{formatTime(chat.timestamp)}</span>
          </div>
          <div className="text-xs text-gray-600 truncate pr-2">
            {typeof chat.lastMessage === 'string' ? chat.lastMessage : chat.lastMessage?.text || 'No messages yet'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalChatCard;
