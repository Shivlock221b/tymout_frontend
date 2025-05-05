import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import ChatMessageBubble from './ChatMessageBubble';
import { useChatSocket } from '../../hooks/useChatSocket';

const ChatMessageList = ({ messages: propMessages, currentUserId, eventId, onReplyTo }) => {
  const { deleteMessage } = useChatSocket(eventId);
  const listRef = useRef(null);
  // internal state to track if user is near the bottom
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Store refs to message elements for scrolling
  const messageRefs = useRef({});
  // Keep track of previous message count to detect new messages
  const prevMessageCount = useRef(0);
  // Track first render per event
  const isFirstRender = useRef(true);

  // Function to scroll to a specific message by ID
  const scrollToMessage = (messageId) => {
    if (messageRefs.current[messageId] && listRef.current) {
      const messageElement = messageRefs.current[messageId];
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash highlight effect on the message
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 1500);
    }
  };

  // Scroll handler to flag bottom proximity
  const handleScroll = () => {
    const scrollElement = listRef.current || document.documentElement;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const atBottom = scrollHeight - (scrollTop + clientHeight) < 100; // px threshold
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (!propMessages || propMessages.length === 0) return;
    
    // Detect if new messages arrived
    const newMessagesArrived = propMessages.length > prevMessageCount.current;
    prevMessageCount.current = propMessages.length;

    // Force scroll on new messages
    if (newMessagesArrived && listRef.current) {
      const scrollToBottom = () => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
      };
      // immediate scroll
      scrollToBottom();
      // extra scroll after keyboard/layout settles
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 150);
      console.log('Auto-scrolling to new message (with keyboard-safe retries)');
    }
  }, [propMessages]);

  // Reset firstRender when event changes
  useEffect(() => {
    isFirstRender.current = true;
  }, [eventId]);

  // Ensure view starts at bottom on first render (before paint)
  useLayoutEffect(() => {
    if (isFirstRender.current && listRef.current && Array.isArray(propMessages) && propMessages.length > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      isFirstRender.current = false;
    }
  }, [propMessages]);

  // Handle virtual keyboard resize on mobile browsers
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return; // fallback for desktop
    const onVVResize = () => {
      // When keyboard opens the viewport height shrinks; keep last msg visible
      if (isAtBottom && listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    };
    viewport.addEventListener('resize', onVVResize);
    return () => viewport.removeEventListener('resize', onVVResize);
  }, [isAtBottom]);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex flex-col gap-2 px-3 w-full pb-16 overflow-y-auto flex-1 relative"
      style={{
        scrollPaddingBottom: '90px',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5))',
        backdropFilter: 'blur(1px)'
      }}
    >
      {/* Chat date separator - can be added for message grouping by date */}
      <div className="sticky top-0 z-10 flex justify-center my-2">
        <div className="bg-white bg-opacity-80 backdrop-blur-sm text-xs text-gray-500 px-3 py-1 rounded-full shadow-sm">
          Today
        </div>
      </div>
      
      {Array.isArray(propMessages) && propMessages.map((msg, idx) => {
        let senderId = '';
        if (msg.sender === undefined || msg.sender === null) {
          senderId = '';
        } else if (typeof msg.sender === 'object') {
          senderId = msg.sender._id || msg.sender.id || msg.sender.username || msg.sender.email || '';
        } else {
          senderId = msg.sender;
        }
        // Check if the message has a pre-processed _senderId field
        const isOwn = msg._senderId 
          ? msg._senderId === String(currentUserId).trim()
          : String(senderId).trim() === String(currentUserId).trim();
        return (
          <ChatMessageBubble
            key={msg._id || msg.id || idx}
            message={msg}
            isOwn={isOwn}
            userPhoto={msg.senderPhoto || msg.userPhoto || undefined}
            onDelete={deleteMessage}
            onReplyTo={(message, scrollToId) => {
              if (scrollToId) {
                // Handle scrolling to original message
                scrollToMessage(scrollToId);
              } else if (message && onReplyTo) {
                // Handle normal reply action
                onReplyTo(message);
              }
            }}
            ref={(el) => {
              if (el) {
                // Store ref to this message's DOM element
                messageRefs.current[msg._id || msg.id || `msg-${idx}`] = el;
              }
            }}
          />
        );
      })}
      
      {/* Empty state when no messages */}
      {(!propMessages || propMessages.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-center">No messages yet.<br/>Start the conversation!</p>
        </div>
      )}
      
      {/* scroll-to-bottom button */}
      {!isAtBottom && (
        <button
          type="button"
          className="fixed right-4 bottom-28 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none z-40 flex items-center justify-center"
          onClick={() => {
            const el = listRef.current || document.documentElement;
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
          aria-label="Scroll to latest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      )}
    </div>
  );
};

export default ChatMessageList;
