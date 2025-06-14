import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import MessageBubble from './MessageBubble';
import MessageTypingIndicator from './MessageTypingIndicator';

// Simple message list with auto-scroll to bottom
const ChatMessageList = ({ messages, typingUsers, currentUserId }) => {
  const listRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id || msg.clientMsgId}
          message={{
            id: msg._id || msg.clientMsgId,
            content: msg.text,
            timestamp: msg.timestamp,
            sender: msg.senderId || msg.sender,
            status: msg.status
          }}
          isOwn={String(msg.senderId) === String(currentUserId)}
        />
      ))}
      {typingUsers.length > 0 && <MessageTypingIndicator />}
    </div>
  );
};

ChatMessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  typingUsers: PropTypes.array,
  currentUserId: PropTypes.string
};

ChatMessageList.defaultProps = {
  typingUsers: []
};

export default ChatMessageList;
