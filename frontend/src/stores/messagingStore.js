import { create } from 'zustand';
import { createStore } from './middleware';

/**
 * Messaging UI store for managing client-side messaging state
 * Following Single Responsibility Principle - this store only handles UI state for messaging
 */
export const useMessagingStore = create(
  createStore('messaging', (set, get) => ({
    // Active thread ID
    activeThreadId: null,
    
    // UI state for conversation
    uiState: {
      isMessagePanelOpen: false,
      showTagFilter: true,
      isTyping: {},  // Maps threadId -> boolean
      draft: {},     // Maps threadId -> draft message content
      searchTerm: '',
      selectedTag: 'Table', // Default to Table tag
    },
    
    // Set active thread ID
    setActiveThreadId: (threadId) => 
      set({ activeThreadId: threadId }),
    
    // Toggle message panel open/closed
    toggleMessagePanel: () => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          isMessagePanelOpen: !state.uiState.isMessagePanelOpen 
        } 
      })),
    
    // Toggle tag filter visibility
    toggleTagFilter: () => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          showTagFilter: !state.uiState.showTagFilter 
        } 
      })),
    
    // Set typing status for a thread
    setTypingStatus: (threadId, isTyping) => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          isTyping: { 
            ...state.uiState.isTyping, 
            [threadId]: isTyping 
          } 
        } 
      })),
    
    // Update draft message for a thread
    updateDraft: (threadId, content) => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          draft: { 
            ...state.uiState.draft, 
            [threadId]: content 
          } 
        } 
      })),
    
    // Clear draft message for a thread
    clearDraft: (threadId) => 
      set((state) => {
        const newDraft = { ...state.uiState.draft };
        delete newDraft[threadId];
        
        return { 
          uiState: { 
            ...state.uiState, 
            draft: newDraft
          } 
        };
      }),
    
    // Set search term
    setSearchTerm: (term) => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          searchTerm: term 
        } 
      })),
    
    // Set selected tag
    setSelectedTag: (tag) => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          selectedTag: tag 
        } 
      })),
    
    // Clear selected tag
    clearSelectedTag: () => 
      set((state) => ({ 
        uiState: { 
          ...state.uiState, 
          selectedTag: null 
        } 
      }))
  }))
);
