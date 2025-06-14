import { useUIStore } from '../../stores/uiStore';
import { useMemo } from 'react';

/**
 * Custom hook that replaces ScrollToElementContext functionality
 * Provides the same API as the previous context for seamless migration
 * Follows Interface Segregation Principle
 * @returns {Object} ScrollToElement functions
 */
export const useScrollToElement = () => {
  const scrollToElement = useUIStore(state => state.scrollToElement);
  const setScrollTarget = useUIStore(state => state.setScrollTarget);
  const getScrollTarget = useUIStore(state => state.getScrollTarget);
  const clearScrollTarget = useUIStore(state => state.clearScrollTarget);
  
  // Return memoized object to prevent recreation on each render
  return useMemo(() => ({
    scrollToElement,
    setScrollTarget,
    getScrollTarget,
    clearScrollTarget,
  }), [scrollToElement, setScrollTarget, getScrollTarget, clearScrollTarget]);
};

/**
 * Custom hook for modal state
 * Follows Interface Segregation Principle by exposing only modal-related functionality
 * @returns {Object} Modal state and functions
 */
export const useModal = () => {
  const isOpen = useUIStore(state => state.modalState.isOpen);
  const modalType = useUIStore(state => state.modalState.modalType);
  const modalProps = useUIStore(state => state.modalState.modalProps);
  const openModal = useUIStore(state => state.openModal);
  const closeModal = useUIStore(state => state.closeModal);
  
  // Return memoized object to prevent recreation on each render
  return useMemo(() => ({
    isOpen,
    modalType,
    modalProps,
    openModal,
    closeModal
  }), [isOpen, modalType, modalProps, openModal, closeModal]);
};
