import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

/**
 * Creates a persisted store with Immer and Redux DevTools integration
 * @param {string} name - Unique name for the store (used for persistence and devtools)
 * @param {Function} createState - Function that defines the store's initial state and actions
 * @param {Object} options - Additional options for persist middleware
 * @returns {Function} - The created store
 */
export const createPersistedStore = (name, createState, options = {}) => {
  return (set, get, api) => {
    return devtools(
      persist(
        immer(createState),
        {
          name: `${name}-storage`,
          getStorage: () => localStorage,
          partialize: (state) => {
            // Default behavior: exclude functions from persistence
            const persistedState = {};
            Object.keys(state).forEach((key) => {
              if (typeof state[key] !== 'function') {
                persistedState[key] = state[key];
              }
            });
            return persistedState;
          },
          ...options
        }
      ),
      { name }
    )(set, get, api);
  };
};

/**
 * Creates a store with Immer and Redux DevTools integration (no persistence)
 * @param {string} name - Unique name for the store (used for devtools)
 * @param {Function} createState - Function that defines the store's initial state and actions
 * @returns {Function} - The created store
 */
export const createStore = (name, createState) => {
  return (set, get, api) => {
    return devtools(
      immer(createState),
      { name }
    )(set, get, api);
  };
};
