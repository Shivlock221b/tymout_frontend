import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Host Store
 * 
 * Following Single Responsibility Principle:
 * - This store is responsible only for UI state related to hosting events
 * - It does not handle API calls or data fetching (those are in React Query hooks)
 */
const useHostStore = create(
  devtools(
    persist(
      (set) => ({
        // Active tab in host dashboard 
        activeTab: 'upcoming',
        
        // Current event template being used
        currentTemplateId: null,
        
        // UI state for event creation wizard
        creationStep: 0,
        
        // Form draft for event creation
        eventDraft: null,
        
        // Actions
        setActiveTab: (tab) => set({ activeTab: tab }),
        
        setCurrentTemplateId: (templateId) => set({ currentTemplateId: templateId }),
        
        setCreationStep: (step) => set({ creationStep: step }),
        
        incrementCreationStep: () => set((state) => ({ 
          creationStep: state.creationStep + 1 
        })),
        
        decrementCreationStep: () => set((state) => ({ 
          creationStep: Math.max(0, state.creationStep - 1) 
        })),
        
        setEventDraft: (draft) => set({ eventDraft: draft }),
        
        updateEventDraft: (updates) => set((state) => ({
          eventDraft: state.eventDraft ? { ...state.eventDraft, ...updates } : updates
        })),
        
        resetEventCreation: () => set({ 
          creationStep: 0,
          currentTemplateId: null,
          eventDraft: null
        })
      }),
      {
        name: 'host-storage',
        partialize: (state) => ({
          // Only persist the event draft to localStorage
          eventDraft: state.eventDraft
        }),
      }
    )
  )
);

export default useHostStore;
