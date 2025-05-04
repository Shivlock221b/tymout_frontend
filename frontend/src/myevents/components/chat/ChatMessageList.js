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
    // More generous threshold (200px) to consider "at bottom"
    const atBottom = scrollHeight - (scrollTop + clientHeight) < 200; // px threshold
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
      
      // Immediate scroll
      scrollToBottom();
      
      // Multiple delayed scrolls to handle keyboard appearance and layout shifts
      // These timings ensure we catch the scroll position after keyboard appears
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 150);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 500);
      
      // For iOS specifically, which can have delayed keyboard animations
      setTimeout(scrollToBottom, 800);
      
      console.log('Auto-scrolling to new message (with enhanced keyboard-safe retries)');
    }
  }, [propMessages]);

  // Reset firstRender when event changes
  useEffect(() => {
    isFirstRender.current = true;
    console.log('Event changed, resetting firstRender flag');
  }, [eventId]);

  // Ensure view starts at bottom on first render (before paint)
  useLayoutEffect(() => {
    if (listRef.current && Array.isArray(propMessages) && propMessages.length > 0) {
      // Always scroll to bottom on first render
      if (isFirstRender.current) {
        console.log('First render detected, scrolling to bottom');
        listRef.current.scrollTop = listRef.current.scrollHeight;
        isFirstRender.current = false;
      }
      
      // Also scroll when messages change and we're at the bottom
      if (isAtBottom) {
        console.log('At bottom and messages changed, scrolling to bottom');
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [propMessages, isAtBottom]);

  // Handle virtual keyboard resize on mobile browsers
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return; // fallback for desktop
    
    const onVVResize = () => {
      // When keyboard opens the viewport height shrinks; keep last msg visible
      if (listRef.current) {
        // Always scroll to bottom during keyboard resize events if we were near bottom
        // Using a more generous threshold for "near bottom" during keyboard events
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        
        // More generous 150px threshold during keyboard events
        if (distanceFromBottom < 150 || isAtBottom) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }
    };
    
    // Handle both resize and scroll events
    viewport.addEventListener('resize', onVVResize);
    
    // Also listen for keyboard show/hide events on iOS
    window.addEventListener('focusin', () => {
      // When input gets focus (keyboard likely to appear)
      setTimeout(() => {
        if (listRef.current && isAtBottom) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 300); // Delay to account for keyboard animation
    });
    
    return () => {
      viewport.removeEventListener('resize', onVVResize);
      window.removeEventListener('focusin', onVVResize);
    };
  }, [isAtBottom]);

  // Listen for new message events from useChatSocket
  useEffect(() => {
    const handleNewMessage = () => {
      console.log('ChatMessageList: New message event received, scrolling to bottom');
      
      // Immediate scroll
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
      
      // Multiple delayed scrolls to handle keyboard and layout shifts
      const scrollToBottom = () => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      };
      
      // Schedule multiple scrolls to catch any layout shifts
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 150);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 500);
    };
    
    // Listen for the custom event
    window.addEventListener('newMessageReceived', handleNewMessage);
    
    return () => {
      window.removeEventListener('newMessageReceived', handleNewMessage);
    };
  }, []);
  
  // Force scroll to bottom when component mounts or updates
  useEffect(() => {
    // This effect runs on every render, but we only want to scroll
    // when we're at the bottom or there are new messages
    if (listRef.current) {
      // Use RAF to ensure we scroll after layout is complete
      requestAnimationFrame(() => {
        if (listRef.current) {
          // On initial mount, always scroll to bottom
          if (isFirstRender.current) {
            console.log('Initial mount detected in RAF, forcing scroll to bottom');
            listRef.current.scrollTop = listRef.current.scrollHeight;
            isFirstRender.current = false;
            return;
          }
          
          // Otherwise, only scroll if we're at the bottom
          if (isAtBottom) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }
      });
    }
    
    // Also set up a delayed scroll to handle any layout shifts
    const timeoutId = setTimeout(() => {
      if (listRef.current) {
        console.log('Delayed scroll check running');
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [isAtBottom]);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex flex-col gap-1 px-2 w-full overflow-y-auto flex-1 relative"
      style={{
        scrollPaddingBottom: '60px',
        paddingBottom: '20px' // Reduced padding now that we have reliable auto-scrolling
      }}
    >
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
      {/* scroll-to-bottom button */}
      {!isAtBottom && (
        <button
          type="button"
          className="fixed right-4 bottom-28 bg-theme-accent text-white p-2 rounded-full shadow-lg hover:bg-theme-accent/90 focus:outline-none z-40"
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
