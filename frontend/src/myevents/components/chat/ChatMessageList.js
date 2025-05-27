import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import ChatMessageBubble from './ChatMessageBubble';
import TypingIndicator from './TypingIndicator';
import { useChatSocket } from '../../hooks/useChatSocket';
import './typing-indicator.css';
import '../../../styles/chat-custom.css';

const ChatMessageList = ({ messages: propMessages, currentUserId, eventId, onReplyTo, typingUsers = [], unreadCount = 0 }) => {
  const { deleteMessage, sendMessage, setMessages, markMessagesAsRead } = useChatSocket(eventId);
  const listRef = useRef(null);
  // internal state to track if user is near the bottom
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Store refs to message elements for scrolling
  const messageRefs = useRef({});
  // Keep track of previous message count to detect new messages
  const prevMessageCount = useRef(0);
  // Track first render per event
  const isFirstRender = useRef(true);
  // Track if we've scrolled to unread messages
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  // Store the first unread message ID
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  // Track if there's an unread divider displayed
  const [showUnreadDivider, setShowUnreadDivider] = useState(false);

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

  // Reset state when event changes
  useEffect(() => {
    console.log('Event changed, resetting chat state');
    isFirstRender.current = true;
    setHasScrolledToUnread(false);
    setFirstUnreadMessageId(null);
    setShowUnreadDivider(false);
    
    // Clear message refs when changing events
    messageRefs.current = {};
    prevMessageCount.current = 0;
  }, [eventId]);

  // Find the first unread message and scroll to it on first render
  useLayoutEffect(() => {
    console.log('ChatMessageList useLayoutEffect - messages, unreadCount:', propMessages.length, unreadCount);
    
    // Only process if we have messages and the component is mounted
    if (!listRef.current || !Array.isArray(propMessages) || propMessages.length === 0) return;
    
    // If this is the first render and we have unread messages
    if (isFirstRender.current && unreadCount > 0 && !hasScrolledToUnread) {
      console.log('Processing unread messages, count:', unreadCount);
      
      // Find messages not sent by current user and not read by current user
      const unreadMessages = propMessages.filter(msg => {
        // Skip messages sent by this user
        if (String(msg.senderId) === String(currentUserId)) return false;
        // Check if user has read this message
        const hasRead = msg.readBy && msg.readBy.some(read => String(read.userId) === String(currentUserId));
        return !hasRead;
      });
      
      console.log('Found unread messages:', unreadMessages.length);
      
      if (unreadMessages.length > 0) {
        // Sort by timestamp to get the oldest unread message
        unreadMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const firstUnread = unreadMessages[0];
        console.log('First unread message:', firstUnread);
        
        setFirstUnreadMessageId(firstUnread._id);
        setShowUnreadDivider(true);
        
        // Use a series of timeouts with increasing delays to ensure the DOM is ready
        // This helps with race conditions where the refs might not be set yet
        const scrollToUnreadMessage = (attempt = 1) => {
          console.log(`Attempt ${attempt} to scroll to unread message`);
          
          if (messageRefs.current[firstUnread._id]) {
            // Scroll to the first unread message
            messageRefs.current[firstUnread._id].scrollIntoView({ behavior: 'auto', block: 'center' });
            
            // Add a visual highlight
            messageRefs.current[firstUnread._id].classList.add('bg-yellow-100');
            setTimeout(() => {
              if (messageRefs.current[firstUnread._id]) {
                messageRefs.current[firstUnread._id].classList.remove('bg-yellow-100');
              }
            }, 2000);
            
            // Mark that we've scrolled to unread
            setHasScrolledToUnread(true);
            
            // Mark messages as read after a short delay
            setTimeout(() => {
              markMessagesAsRead(eventId);
            }, 1000);
            
            console.log('Successfully scrolled to unread message');
          } else if (attempt < 5) {
            // Try again with increasing delay (exponential backoff)
            setTimeout(() => scrollToUnreadMessage(attempt + 1), 100 * Math.pow(2, attempt));
          } else {
            console.log('Failed to scroll to unread message after multiple attempts');
            // Fallback to bottom scroll if we can't find the message after several attempts
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        };
        
        // Start the scroll attempt process
        scrollToUnreadMessage();
      } else {
        // If no unread messages found, scroll to bottom as usual
        console.log('No unread messages found, scrolling to bottom');
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } else if (isFirstRender.current) {
      // If no unread messages, scroll to bottom as usual
      console.log('No unread count, scrolling to bottom');
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    
    isFirstRender.current = false;
  }, [propMessages, unreadCount, currentUserId, eventId, hasScrolledToUnread, markMessagesAsRead]);

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

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    
    messages.forEach(msg => {
      const messageDate = new Date(msg.timestamp || msg.createdAt || Date.now());
      const messageDay = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate()
      ).toISOString();
      
      if (messageDay !== currentDate) {
        // If we have messages in the current group, save it
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup
          });
        }
        
        // Start a new group
        currentDate = messageDay;
        currentGroup = [msg];
      } else {
        // Add to current group
        currentGroup.push(msg);
      }
    });
    
    // Add the last group
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup
      });
    }
    
    return groups;
  };
  
  // Format date for display
  const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset hours to compare just the date
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    if (messageDateOnly.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    } else {
      // Format as Month Day, Year for older dates
      return messageDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };
  
  // Group messages by date
  const messageGroups = groupMessagesByDate(propMessages);

  // Handler to resend failed messages
  const handleResend = (failedMessage) => {
    // Remove the failed message from the list
    setMessages(prev => prev.filter(m => m._id !== failedMessage._id));
    // Re-send the message (call sendMessage with the same text/replyTo)
    sendMessage(failedMessage.text, failedMessage.replyTo);
  };

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex flex-col gap-1 w-full pb-16 overflow-y-auto flex-1 relative chat-scrollbar"
      style={{
        scrollPaddingBottom: '90px'
      }}
    >
      {/* Encryption Notice Banner */}
      <div className="w-full px-3 pt-2 pb-1">
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-3 border border-gray-100">
          <div className="flex flex-col gap-1 justify-center text-center text-gray-700">
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-medium">🔒 All messages are end‑to‑end encrypted</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-medium">💬 Single Tap to Reply</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-medium">❌ Long‑Press to Delete your message</span>
            </div>
          </div>
        </div>
      </div>
      {messageGroups.length > 0 ? (
        messageGroups.map((group, groupIndex) => (
          <div key={group.date || `group-${groupIndex}`} className="flex flex-col gap-0.5">
            {/* Date separator for each group */}
            <div className="sticky top-0 z-10 flex justify-center my-2">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm text-xs text-gray-500 px-3 py-1 rounded-full shadow-sm">
                {formatMessageDate(group.date)}
              </div>
            </div>
            
            {/* Messages in this date group */}
            {group.messages.map((msg, idx) => {
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
                <div
                  key={msg._id}
                  ref={el => (messageRefs.current[msg._id] = el)}
                  className="w-full"
                >
                  {/* Unread messages divider */}
                  {showUnreadDivider && firstUnreadMessageId === msg._id && (
                    <div className="flex items-center justify-center my-2">
                      <div className="bg-red-100 text-red-600 text-xs px-4 py-1 rounded-full font-medium shadow-sm animate-pulse">
                        Unread Messages ({unreadCount})
                      </div>
                    </div>
                  )}
                  <ChatMessageBubble
                    message={msg}
                    isOwn={isOwn}
                    userPhoto={msg.senderAvatar || msg.avatar || msg.photo || undefined}
                    onDelete={deleteMessage}
                    onReplyTo={(message, messageId) => {
                      // If messageId is provided, scroll to that message
                      if (messageId) {
                        scrollToMessage(messageId);
                      } else {
                        // Otherwise, use the original onReplyTo handler
                        onReplyTo && onReplyTo(message);
                      }
                    }}
                    onResend={handleResend}
                  />
                </div>
              );
            })}
          </div>
        ))
      ) : (
        /* Empty state when no messages */
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-center font-medium">No messages yet.<br/>Start the conversation!</p>
        </div>
      )}
      
      {/* scroll-to-bottom button */}
      {!isAtBottom && (
        <button
          type="button"
          className="fixed left-4 bottom-36 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none z-40 flex items-center justify-center"
          onClick={() => {
            const el = listRef.current || document.documentElement;
            if (el) {
              el.scrollTo({
                top: el.scrollHeight,
                behavior: 'smooth'
              });
            }
          }}
          aria-label="Scroll to latest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      )}
      
      {/* Typing indicator - shown at the bottom of the chat */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="sticky bottom-0 w-full z-10 animate-fadeIn">
          <div className="mx-2 mb-2 rounded-full shadow-sm overflow-hidden transform transition-all duration-300 ease-in-out">
            <TypingIndicator typingUsers={typingUsers} currentUserId={currentUserId} />
          </div>
        </div>
      )}
      <div className="h-20 w-full flex-shrink-0 pb-16" id="chat-end-spacer" aria-hidden="true"></div>
    </div>
  );
};

export default ChatMessageList;
