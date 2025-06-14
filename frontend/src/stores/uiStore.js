import { create } from 'zustand';
import { createStore } from './middleware';

/**
 * UI store for managing client-side UI state
 * Following Single Responsibility Principle - this store only manages UI state
 */
export const useUIStore = create(
  createStore('ui', (set, get) => ({
    // Scroll state - maps pages to element IDs
    scrollTargets: {},
    
    // Modal state
    modalState: {
      isOpen: false,
      modalType: null,
      modalProps: {},
    },
    
    // ScrollToElement actions - matching previous context API functionality
    setScrollTarget: (page, elementId) => 
      set((state) => ({ 
        scrollTargets: { ...state.scrollTargets, [page]: elementId } 
      })),
    
    getScrollTarget: (page) => {
      return get().scrollTargets[page];
    },
    
    clearScrollTarget: (page) => 
      set((state) => {
        const newTargets = { ...state.scrollTargets };
        delete newTargets[page];
        return { scrollTargets: newTargets };
      }),
    
    // Original scroll functionality (deprecated - use the above methods instead)
    scrollToElement: (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    },
    
    // Actions for modal state
    openModal: (modalType, modalProps = {}) => 
      set({ modalState: { isOpen: true, modalType, modalProps } }),
    
    closeModal: () => set({
      modalState: { isOpen: false, modalType: null, modalProps: {} }
    }),
  }))
);
