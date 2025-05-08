import React, { useState, useRef, forwardRef, useMemo } from 'react';
import { getColorForName } from './name-colors';

const LONG_PRESS_DURATION = 600; // ms

const ChatMessageBubble = forwardRef(({ message, isOwn, userPhoto, onDelete, onReplyTo }, ref) => {
  // Get initials from name for avatar fallback
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };
  
  // Get consistent color for sender
  const senderIdentifier = useMemo(() => {
    if (isOwn) return 'me';
    return message.senderId || 
           (typeof message.sender === 'object' ? (message.sender._id || message.sender.id) : message.sender) || 
           message.senderName || 
           'unknown';
  }, [isOwn, message]);
  
  const senderColorClass = useMemo(() => getColorForName(senderIdentifier), [senderIdentifier]);
  const [pressTimer, setPressTimer] = useState(null);
  const touchRef = useRef();

  // Long press for mobile
  const handleTouchStart = () => {
    if (!isOwn || message.isDeleted || message.deleted) return;
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
    if (!isOwn || message.isDeleted || message.deleted) return;
    e.preventDefault();
    onDelete && onDelete(message._id);
  };

  // Handle reply to this message
  const handleReplyClick = (e) => {
    e.stopPropagation();
    if (message.isDeleted || message.deleted) return;
    onReplyTo && onReplyTo(message);
  };

  // Improved UX: right for self, left for others, avatars accordingly
  return (
    <div
      className={`flex items-end mb-2 w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar for other users (left) */}
      {!isOwn && (
        userPhoto ? (
          <img
            src={userPhoto}
            alt="Member"
            className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-50 mr-2"
            style={{ order: 0 }}
          />
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 text-xs font-bold border border-gray-200 mr-2"
            style={{ order: 0 }}
          >
            {getInitials(message.senderName || 
              (typeof message.sender === 'object' && (message.sender.name || message.sender.username || message.sender.email || '')) || 
              message.sender || 
              'Unknown')}
          </div>
        )
      )}
      {/* Message bubble */}
      <div className="flex flex-col gap-1 max-w-[85%]" style={{ order: 1 }}>
        {/* Reply indicator */}
        {message.replyTo && (
          <div 
            className={`rounded px-2 py-1 text-xs flex items-center gap-1 w-auto cursor-pointer hover:bg-opacity-80 ${
              isOwn ? 'bg-indigo-700/30 ml-auto' : 'bg-gray-200/80 mr-auto'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              // Get the original message ID and pass to parent for scrolling
              const originalMessageId = message.replyTo.messageId;
              if (originalMessageId && typeof onReplyTo === 'function') {
                // Call special handler to scroll to message
                onReplyTo(null, originalMessageId);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7"></polyline>
              <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
            </svg>
            <div className="flex flex-col w-full overflow-hidden">
              <span className="font-medium">
                {message.replyTo.senderName || 
                  (typeof message.replyTo.sender === 'object' && 
                    (message.replyTo.sender.name || message.replyTo.sender.username)) || 
                  'Unknown'}:
              </span>
              <span className="text-xs whitespace-normal break-words">
                {message.replyTo.text || '[deleted]'}
              </span>
            </div>
          </div>
        )}
        
        {/* Message bubble with glass effect */}
        <div
          className={`rounded-lg px-3 py-2 text-base break-words whitespace-pre-line relative ${
            isOwn 
              ? 'chat-bubble-glass-own text-white' 
              : 'chat-bubble-glass text-gray-900'
          }`}
          aria-label={isOwn ? 'Your message' : 'Member message'}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          ref={(el) => {
            // Merge refs
            touchRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          onClick={handleReplyClick}
        >
          {/* Sender name above bubble */}
          <div className={`text-xs mb-1 font-medium ${isOwn ? 'text-right text-indigo-100' : `text-left ${senderColorClass}`}`}>
            {isOwn ? 'You' : (
              message.senderName ||
              (typeof message.sender === 'object' && (message.sender.name || message.sender.username || message.sender.email || message.sender._id || message.sender.id)) ||
              message.sender ||
              'Unknown'
            )}
          </div>
          <div>
            {(message.isDeleted || message.deleted)
              ? <span className="italic text-gray-400">This message was deleted</span>
              : (<span className="break-words">{message.text || <span className="text-red-500">[Empty]</span>}</span>)}
          </div>
          <div className={`text-xs mt-1 text-right flex items-center gap-1 justify-end ${isOwn ? 'text-indigo-100' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isOwn && !(message.isDeleted || message.deleted) && (
              message.pending || message.status === 'pending' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : message.status === 'sent' || !message.status ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.485 1.929a.75.75 0 010 1.06L6.06 10.414a.75.75 0 01-1.06 0L2.515 7.93a.75.75 0 111.06-1.06l2.004 2.003 6.36-6.36a.75.75 0 011.06 0z" />
                </svg>
              ) : message.status === 'delivered' ? (
                <span className="flex items-center gap-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.485 1.929a.75.75 0 010 1.06L6.06 10.414a.75.75 0 01-1.06 0L2.515 7.93a.75.75 0 111.06-1.06l2.004 2.003 6.36-6.36a.75.75 0 011.06 0z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 -ml-1" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.485 1.929a.75.75 0 010 1.06L6.06 10.414a.75.75 0 01-1.06 0L2.515 7.93a.75.75 0 111.06-1.06l2.004 2.003 6.36-6.36a.75.75 0 011.06 0z" />
                  </svg>
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatMessageBubble;
