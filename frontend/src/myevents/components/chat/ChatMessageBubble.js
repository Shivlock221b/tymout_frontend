import React, { useState, useRef, forwardRef, useMemo } from 'react';
import './ChatMessageBubble.css'; // Import the CSS file for animations
import { getColorForName } from './name-colors';

const LONG_PRESS_DURATION = 600; // ms
const MAX_PREVIEW_CHARS = 300;

const ChatMessageBubble = forwardRef(({ message, isOwn, userPhoto, onDelete, onReplyTo, onResend }, ref) => {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Long press for mobile
  const handleTouchStart = () => {
    if (!isOwn || message.isDeleted || message.deleted) return;
    setPressTimer(setTimeout(() => {
      setShowDeleteConfirm(true);
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
    setShowDeleteConfirm(true); // Show confirmation dialog
  };

  // Handle reply to this message
  const handleReplyClick = (e) => {
    e.stopPropagation();
    if (message.isDeleted || message.deleted) return;
    onReplyTo && onReplyTo(message);
  };

  // Helper to highlight #tags, @mentions, and URLs in message text
  function highlightTags(text) {
    if (!text) return null;
    // Regex to match #tag, @mention, or URL
    const tagOrMentionOrUrlRegex = /(@[a-zA-Z0-9_\- ]+)|(#\w+)|(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = tagOrMentionOrUrlRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[1]) {
        // @mention
        parts.push(
          <span
            key={key++}
            className="inline-block bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs font-semibold mx-0.5"
          >
            {match[1]}
          </span>
        );
      } else if (match[2]) {
        // #tag
        parts.push(
          <span
            key={key++}
            className="inline-block bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs font-semibold mx-0.5"
          >
            {match[2]}
          </span>
        );
      } else if (match[3] || match[4]) {
        // URL (http(s) or www)
        let url = match[3] || match[4];
        if (url && !/^https?:\/\//.test(url)) {
          url = 'http://' + url;
        }
        parts.push(
          <a
            key={key++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all hover:text-blue-800"
          >
            {match[3] || match[4]}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }

  // Improved UX: right for self, left for others, avatars accordingly
  return (
    <>
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
        <div
          className={`flex flex-col gap-1 max-w-[85%] relative`}
          style={{ order: 1 }}
        >
          {/* Reply indicator */}
          {message.replyTo && (
            <div 
              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs w-auto cursor-pointer hover:bg-opacity-80 shadow-sm border-l-4 ${
                isOwn ? 'bg-indigo-50 border-indigo-400 ml-auto' : 'bg-gray-100 border-gray-300 mr-auto'
              }`}
              style={{ minHeight: 36, maxWidth: '95%' }}
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
              <div className="flex flex-col w-full overflow-hidden">
                <span className="font-semibold text-indigo-700 truncate max-w-[120px]">
                  {message.replyTo.senderName || 
                    (typeof message.replyTo.sender === 'object' && 
                      (message.replyTo.sender.name || message.replyTo.sender.username)) || 
                    'Unknown'}
                </span>
                <span className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                  {message.replyTo.text ? message.replyTo.text.slice(0, 60) + (message.replyTo.text.length > 60 ? '…' : '') : '[deleted]'}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-gray-400 flex-shrink-0">
                <polyline points="9 17 4 12 9 7"></polyline>
                <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
              </svg>
            </div>
          )}
          
          {/* Message bubble with glass effect */}
          <div
            className={`rounded-lg px-3 py-2 text-base break-words whitespace-pre-line relative ${
              isOwn 
                ? 'chat-bubble-glass-own bg-gray-200 text-gray-900' 
                : 'chat-bubble-glass text-gray-900'
            } ${message.pending || message.status === 'pending' ? '' : 'message-sent'}`}
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
            <div className={`text-xs mb-1 font-medium ${isOwn ? 'text-right text-gray-600' : `text-left ${senderColorClass}`}`}>
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
                : (
                  <>
                    <span className="break-words">
                      {expanded || (message.text || '').length <= MAX_PREVIEW_CHARS
                        ? highlightTags(message.text)
                        : highlightTags((message.text || '').slice(0, MAX_PREVIEW_CHARS) + '...')}
                    </span>
                    {(message.text || '').length > MAX_PREVIEW_CHARS && (
                      <button
                        className={
                          `ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200`
                        }
                        style={{ verticalAlign: 'middle' }}
                        aria-expanded={expanded}
                        onClick={e => {
                          e.stopPropagation();
                          setExpanded(prev => !prev);
                        }}
                      >
                        {expanded ? 'Show less' : 'Read more'}
                        <svg
                          className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
            </div>
            <div className={`text-xs mt-1 text-right flex items-center gap-1 justify-end ${isOwn ? 'text-gray-600' : 'text-gray-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isOwn && !(message.isDeleted || message.deleted) && (
                message.pending || message.status === 'pending' ? (
                  <div className="blinking-dot"></div>
                ) : (
                  // Tick for sent message
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-500" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.485 1.929a.75.75 0 010 1.06L6.06 10.414a.75.75 0 01-1.06 0L2.515 7.93a.75.75 0 111.06-1.06l2.004 2.003 6.36-6.36a.75.75 0 011.06 0z" />
                  </svg>
                )
              )}
              {/* Resend button for failed messages */}
              {isOwn && message.status === 'failed' && (
                <button
                  className="ml-2 text-xs text-red-600 bg-white rounded px-2 py-0.5 border border-red-200 shadow hover:bg-red-50"
                  onClick={() => onResend && onResend(message)}
                  title="Resend message"
                >
                  Resend
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
            <div className="text-base font-semibold mb-4 text-gray-800">Delete this message?</div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete && onDelete(message._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ChatMessageBubble;
