import React, { useEffect, useRef } from 'react';
import ChatMessageBubble from './ChatMessageBubble';
import { useChatSocket } from '../../hooks/useChatSocket';

const ChatMessageList = ({ messages: propMessages, currentUserId, eventId, onReplyTo }) => {
  const { deleteMessage } = useChatSocket(eventId);
  const listRef = useRef(null);
  // Store refs to message elements for scrolling
  const messageRefs = useRef({});

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

  useEffect(() => {
    if (!propMessages || propMessages.length === 0) return;
    const lastMsg = propMessages[propMessages.length - 1];
    if (!lastMsg) return;
    // Only scroll if the last message was sent by the current user
    let lastSenderId = '';
    if (lastMsg.sender === undefined || lastMsg.sender === null) {
      lastSenderId = '';
    } else if (typeof lastMsg.sender === 'object') {
      lastSenderId = lastMsg.sender._id || lastMsg.sender.id || lastMsg.sender.username || lastMsg.sender.email || '';
    } else {
      lastSenderId = lastMsg.sender;
    }
    if (String(lastSenderId).trim() === String(currentUserId).trim()) {
      // Scroll to bottom
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [propMessages, currentUserId]);


  return (
    <div ref={listRef} className="flex flex-col gap-1 px-2 w-full pb-20">
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
    </div>
  );
};

export default ChatMessageList;
