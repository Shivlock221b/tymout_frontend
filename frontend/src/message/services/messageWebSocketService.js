import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * WebSocket Service for Messaging
 * 
 * This service handles real-time messaging through WebSockets
 * Following Single Responsibility Principle - only handles WebSocket communication
 */

// In a real app, this would be an environment variable
const WS_URL = 'wss://api.tymout.example/ws';

/**
 * Mock WebSocket implementation for development
 * This simulates WebSocket behavior for development purposes
 */
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen({ target: this });
    }, 1000);
  }
  
  send(data) {
    console.log('Mock WebSocket sent:', data);
    
    // Simulate echo response
    const parsedData = JSON.parse(data);
    
    if (parsedData.type === 'message') {
      // Simulate message receipt acknowledgment
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'status',
              messageId: parsedData.messageId,
              status: 'delivered'
            })
          });
        }
      }, 500);
      
      // Simulate automated response after delay
      setTimeout(() => {
        if (Math.random() > 0.5 && this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'message',
              threadId: parsedData.threadId,
              content: `This is an automated response to "${parsedData.content}"`,
              timestamp: new Date().toISOString()
            })
          });
        }
      }, 3000);
    }
    
    if (parsedData.type === 'typing') {
      // Randomly simulate typing back
      if (parsedData.isTyping && Math.random() > 0.7) {
        setTimeout(() => {
          if (this.onmessage) {
            this.onmessage({
              data: JSON.stringify({
                type: 'typing',
                threadId: parsedData.threadId,
                isTyping: true
              })
            });
          }
          
          // Stop typing after a bit
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'typing',
                  threadId: parsedData.threadId,
                  isTyping: false
                })
              });
            }
          }, 2000);
        }, 1000);
      }
    }
  }
  
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ target: this });
  }
}

/**
 * Custom hook for using the messaging WebSocket
 */
export const useMessageWebSocket = (threadId) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socket = useRef(null);
  
  // Initialize WebSocket connection - run only when threadId changes
  useEffect(() => {
    // Create WebSocket connection
    // Use MockWebSocket for development, real WebSocket for production
    socket.current = process.env.NODE_ENV === 'production' 
      ? new WebSocket(`${WS_URL}/thread/${threadId}`)
      : new MockWebSocket(`${WS_URL}/thread/${threadId}`);
    
    // Connection opened
    socket.current.onopen = () => {
      console.log('WebSocket Connected');
      setConnectionStatus('connected');
    };
    
    // Listen for messages
    socket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        setLastMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    // Connection closed
    socket.current.onclose = () => {
      console.log('WebSocket Disconnected');
      setConnectionStatus('disconnected');
    };
    
    // Connection error
    socket.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('disconnected');
    };
    
    // Clean up on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [threadId]); // Only reconnect if threadId changes
  
  // Function to send a message - memoized to maintain stable reference
  const sendMessage = useCallback((content, type = 'text') => {
    if (socket.current && socket.current.readyState === 1) {
      const message = {
        type: 'message',
        threadId,
        content,
        contentType: type,
        timestamp: new Date().toISOString()
      };
      
      socket.current.send(JSON.stringify(message));
      return true;
    }
    
    return false;
  }, [threadId]);
  
  // Function to send typing indicator - memoized to maintain stable reference
  const sendTypingIndicator = useCallback((isTyping) => {
    if (socket.current && socket.current.readyState === 1) {
      const message = {
        type: 'typing',
        threadId,
        isTyping,
        timestamp: new Date().toISOString()
      };
      
      socket.current.send(JSON.stringify(message));
      return true;
    }
    
    return false;
  }, [threadId]);
  
  // Return memoized value to maintain stable reference
  return {
    sendMessage,
    sendTypingIndicator,
    lastMessage,
    connectionStatus
  };
};
