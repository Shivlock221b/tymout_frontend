import { useMessagingStore } from '../../../stores/messagingStore';
import { useMemo } from 'react';

/**
 * Custom hook for messaging thread selection and navigation
 * Follows Interface Segregation Principle by exposing only thread selection related state and actions
 * Uses useMemo to maintain stable object references and prevent re-renders
 * 
 * @returns {Object} Thread selection state and functions
 */
export const useThreadSelection = () => {
  // Select individual primitives/functions to prevent unnecessary re-renders
  const activeThreadId = useMessagingStore(state => state.activeThreadId);
  const setActiveThreadId = useMessagingStore(state => state.setActiveThreadId);
  const isMessagePanelOpen = useMessagingStore(state => state.uiState.isMessagePanelOpen);
  const toggleMessagePanel = useMessagingStore(state => state.toggleMessagePanel);
  
  // Return stable object with useMemo
  return useMemo(() => ({
    activeThreadId,
    setActiveThreadId,
    isMessagePanelOpen,
    toggleMessagePanel
  }), [activeThreadId, setActiveThreadId, isMessagePanelOpen, toggleMessagePanel]);
};

/**
 * Custom hook for messaging UI filters
 * Follows Interface Segregation Principle by exposing only filter related state and actions
 * Uses useMemo to maintain stable object references and prevent re-renders
 * 
 * @returns {Object} Filter state and functions
 */
export const useMessageFilters = () => {
  // Select individual primitives/functions to prevent unnecessary re-renders
  const searchTerm = useMessagingStore(state => state.uiState.searchTerm);
  const setSearchTerm = useMessagingStore(state => state.setSearchTerm);
  const selectedTag = useMessagingStore(state => state.uiState.selectedTag);
  const setSelectedTag = useMessagingStore(state => state.setSelectedTag);
  const clearSelectedTag = useMessagingStore(state => state.clearSelectedTag);
  const showTagFilter = useMessagingStore(state => state.uiState.showTagFilter);
  const toggleTagFilter = useMessagingStore(state => state.toggleTagFilter);
  
  // Return stable object with useMemo
  return useMemo(() => ({
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    clearSelectedTag,
    showTagFilter,
    toggleTagFilter
  }), [searchTerm, setSearchTerm, selectedTag, setSelectedTag, clearSelectedTag, showTagFilter, toggleTagFilter]);
};

/**
 * Custom hook for conversation UI state
 * Follows Interface Segregation Principle by exposing only conversation related state and actions
 * Uses useMemo to maintain stable object references and prevent re-renders
 * 
 * @param {string} threadId - Thread ID for the conversation
 * @returns {Object} Conversation UI state and functions
 */
export const useConversationState = (threadId) => {
  // Select individual primitives/functions to prevent unnecessary re-renders
  const isTyping = useMessagingStore(state => state.uiState.isTyping[threadId] || false);
  const setTypingStatus = useMessagingStore(state => (isTyping) => state.setTypingStatus(threadId, isTyping));
  const draft = useMessagingStore(state => state.uiState.draft[threadId] || '');
  const updateDraft = useMessagingStore(state => (content) => state.updateDraft(threadId, content));
  const clearDraft = useMessagingStore(state => () => state.clearDraft(threadId));
  
  // Return stable object with useMemo
  return useMemo(() => ({
    isTyping,
    setTypingStatus,
    draft,
    updateDraft,
    clearDraft
  }), [isTyping, setTypingStatus, draft, updateDraft, clearDraft]);
};
