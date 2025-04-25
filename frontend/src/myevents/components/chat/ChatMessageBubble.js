import React from 'react';

import { useState, useRef } from 'react';




const LONG_PRESS_DURATION = 600; // ms

const ChatMessageBubble = ({ message, isOwn, userPhoto, onDelete }) => {
  const [pressTimer, setPressTimer] = useState(null);
  const touchRef = useRef();

  // Long press for mobile
  const handleTouchStart = () => {
    if (!isOwn || message.deleted) return;
    setPressTimer(setTimeout(() => {
      onDelete && onDelete(message._id);
    }, LONG_PRESS_DURATION));
  };
  const handleTouchEnd = () => {
    clearTimeout(pressTimer);
    setPressTimer(null);
  };

  // Right click for desktop
  const handleContextMenu = (e) => {
    if (!isOwn || message.deleted) return;
    e.preventDefault();
    onDelete && onDelete(message._id);
  };

  // Improved UX: right for self, left for others, avatars accordingly
  return (
    <div
      className={`flex items-end mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      style={{ width: '100%' }}
    >
      {/* Avatar for other users (left) */}
      {!isOwn && (
        <img
          src={userPhoto || '/default-user.png'}
          alt="Member"
          className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-50 mr-2"
          style={{ order: 0 }}
        />
      )}
      {/* Message bubble */}
      <div
        className={`rounded-lg px-3 py-2 max-w-[50%] text-sm shadow component-card break-words break-all whitespace-pre-line ${isOwn ? 'bg-theme-accent text-white' : 'bg-gray-100 text-gray-900'}`}
        style={isOwn ? { color: '#fff', backgroundColor: 'var(--color-theme-accent, #2563eb)', order: 1 } : { order: 1 }}
        aria-label={isOwn ? 'Your message' : 'Member message'}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={touchRef}
      >
        {/* Sender name above bubble */}
        <div className={`text-xs mb-1 font-medium ${isOwn ? 'text-right text-theme-accent' : 'text-left text-gray-700'}`}>
          {isOwn ? 'You' : (
            message.senderName ||
            (typeof message.sender === 'object' && (message.sender.name || message.sender.username || message.sender.email || message.sender._id || message.sender.id)) ||
            message.sender ||
            'Unknown'
          )}
        </div>
        <div>
          {message.deleted
            ? <span className="italic text-gray-400">This message was deleted.</span>
            : (message.text || <span className="text-red-500">[Empty]</span>)}
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {/* Avatar for self (right) */}
      {isOwn && (
        <img
          src="/user-avatar.png"
          alt="You"
          className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-50 ml-2"
          style={{ order: 2 }}
        />
      )}
    </div>
  );
};

export default ChatMessageBubble;
