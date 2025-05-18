import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MessageItem from './MessageItem';

/**
 * MessageList Component
 * 
 * Following Single Responsibility Principle:
 * - This component is only responsible for rendering a list of message threads
 * - Each message item is handled by a specialized MessageItem component
 */
const MessageList = ({ threads }) => {
  const navigate = useNavigate();
  
  const handleThreadClick = (threadId) => {
    navigate(`/messages/${threadId}`);
  };
  
  return (
    <div className="divide-y">
      {threads.map(thread => (
        <MessageItem 
          key={thread.id}
          thread={thread}
          onClick={() => handleThreadClick(thread.id)}
        />
      ))}
    </div>
  );
};

MessageList.propTypes = {
  threads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      lastMessage: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      unread: PropTypes.number,
      online: PropTypes.bool,
      tags: PropTypes.arrayOf(PropTypes.string)
    })
  ).isRequired
};

export default MessageList;
