import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaPaperPlane, FaSmile, FaPaperclip, FaMicrophone } from 'react-icons/fa';

/**
 * MessageInput Component
 * 
 * Following Single Responsibility Principle:
 * - Only responsible for handling message input and composition
 * - Manages typing events and input validation
 */
const MessageInput = ({ onSendMessage, onTyping, connectionStatus }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
    
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);
  
  // Handle typing indicator
  const handleTypingState = (isUserTyping) => {
    // Only update if the state is changing
    if (isUserTyping !== isTyping) {
      setIsTyping(isUserTyping);
      onTyping(isUserTyping);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Set timeout to stop typing indicator after 2 seconds of inactivity
    if (isUserTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTypingState(e.target.value.length > 0);
  };
  
  // Handle message send
  const handleSend = () => {
    if (message.trim() && connectionStatus === 'connected') {
      onSendMessage(message);
      setMessage('');
      handleTypingState(false);
      inputRef.current?.focus();
    }
  };
  
  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="flex items-center">
      {/* Attachment button */}
      <button 
        className="p-2 text-gray-500 hover:text-indigo-600 transition"
        aria-label="Add attachment"
      >
        <FaPaperclip />
      </button>
      
      {/* Message input field */}
      <div className="flex-1 mx-2">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
          className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={1}
          disabled={connectionStatus !== 'connected'}
        />
      </div>
      
      {/* Emoji button */}
      <button 
        className="p-2 text-gray-500 hover:text-indigo-600 transition mr-1"
        aria-label="Add emoji"
      >
        <FaSmile />
      </button>
      
      {/* Voice message button */}
      <button 
        className="p-2 text-gray-500 hover:text-indigo-600 transition mr-1"
        aria-label="Record voice message"
      >
        <FaMicrophone />
      </button>
      
      {/* Send button */}
      <button 
        onClick={handleSend}
        disabled={!message.trim() || connectionStatus !== 'connected'}
        className={`p-2 rounded-full ${
          message.trim() && connectionStatus === 'connected'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        } transition`}
        aria-label="Send message"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  connectionStatus: PropTypes.oneOf(['connecting', 'connected', 'disconnected']).isRequired
};

MessageInput.defaultProps = {
  connectionStatus: 'connecting'
};

export default MessageInput;
