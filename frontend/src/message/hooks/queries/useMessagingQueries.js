import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import messagingService from '../../services/messagingService';

/**
 * Custom hook for fetching message threads
 * Following Single Responsibility Principle and Interface Segregation Principle
 * 
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useMessageThreads = (options = {}) => {
  return useQuery({
    queryKey: ['messageThreads'],
    queryFn: messagingService.getMessageThreads,
    staleTime: 30 * 1000, // 30 seconds
    ...options
  });
};

/**
 * Custom hook for fetching thread messages
 * 
 * @param {string} threadId - Thread ID
 * @param {Object} options - React Query options
 * @returns {Object} - React Query result object
 */
export const useThreadMessages = (threadId, options = {}) => {
  return useQuery({
    queryKey: ['threadMessages', threadId],
    queryFn: () => messagingService.getThreadMessages(threadId),
    enabled: !!threadId,
    staleTime: 10 * 1000, // 10 seconds
    ...options
  });
};

/**
 * Custom hook for sending messages
 * 
 * @returns {Object} - React Query mutation object
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, content }) => 
      messagingService.sendMessage(threadId, content),
    
    // When mutate is called:
    onMutate: async ({ threadId, content }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['threadMessages', threadId] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['threadMessages', threadId]);
      
      // Optimistically update the UI
      queryClient.setQueryData(['threadMessages', threadId], old => {
        if (!old || !old.messages) return old;
        
        const optimisticMessage = {
          id: `temp_${Date.now()}`,
          threadId,
          senderId: 'current_user',
          senderName: 'You',
          content,
          timestamp: new Date().toISOString(),
          status: 'sending'
        };
        
        return {
          ...old,
          messages: [...old.messages, optimisticMessage]
        };
      });
      
      // Return the snapshot for rollback
      return { previousMessages };
    },
    
    // If the mutation fails, roll back
    onError: (err, { threadId }, context) => {
      queryClient.setQueryData(
        ['threadMessages', threadId],
        context.previousMessages
      );
    },
    
    // Always refetch after error or success
    onSettled: (_, __, { threadId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['threadMessages', threadId] 
      });
    }
  });
};

/**
 * Custom hook for marking a thread as read
 * 
 * @returns {Object} - React Query mutation object
 */
export const useMarkThreadAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (threadId) => messagingService.markThreadAsRead(threadId),
    
    // When mutate is called:
    onMutate: async (threadId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messageThreads'] });
      
      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData(['messageThreads']);
      
      // Optimistically update the UI
      queryClient.setQueryData(['messageThreads'], old => {
        if (!old) return old;
        
        return old.map(thread => {
          if (thread.id === threadId) {
            return { ...thread, unread: 0 };
          }
          return thread;
        });
      });
      
      // Return the snapshot for rollback
      return { previousThreads };
    },
    
    // If the mutation fails, roll back
    onError: (err, threadId, context) => {
      queryClient.setQueryData(['messageThreads'], context.previousThreads);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messageThreads'] });
    }
  });
};

/**
 * Custom hook for real-time WebSocket integration with React Query
 * 
 * @param {string} activeThreadId - Currently active thread ID
 * @returns {Object} - WebSocket controller
 */
export const useMessageWebSocket = (activeThreadId) => {
  const queryClient = useQueryClient();
  const wsRef = useRef(null);
  
  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = messagingService.initializeWebSocket(
      // Handle new message received
      (message) => {
        // Update thread messages if it's the active thread
        if (message.threadId === activeThreadId) {
          queryClient.setQueryData(['threadMessages', activeThreadId], old => {
            if (!old || !old.messages) return old;
            return {
              ...old,
              messages: [...old.messages, message]
            };
          });
        }
        
        // Update threads list to show the new message
        queryClient.setQueryData(['messageThreads'], old => {
          if (!old) return old;
          
          return old.map(thread => {
            if (thread.id === message.threadId) {
              return { 
                ...thread, 
                lastMessage: message.content,
                timestamp: message.timestamp,
                unread: thread.id !== activeThreadId ? (thread.unread || 0) + 1 : 0
              };
            }
            return thread;
          });
        });
      },
      
      // Handle typing status updates
      (threadId, isTyping) => {
        // No need to update cache, this is handled by the Zustand store
      },
      
      // Handle thread updates (e.g., read status)
      (updatedThread) => {
        queryClient.setQueryData(['messageThreads'], old => {
          if (!old) return old;
          
          return old.map(thread => {
            if (thread.id === updatedThread.id) {
              return { ...thread, ...updatedThread };
            }
            return thread;
          });
        });
      }
    );
    
    // Clean up WebSocket connection on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [queryClient, activeThreadId]);
  
  // Typing status function
  const sendTypingStatus = (isTyping) => {
    if (wsRef.current && activeThreadId) {
      wsRef.current.sendTypingStatus(activeThreadId, isTyping);
    }
  };
  
  return {
    sendTypingStatus,
    isConnected: wsRef.current?.isConnected || false
  };
};
