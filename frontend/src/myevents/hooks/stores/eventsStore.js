// eventsStore.js
// Zustand store for local UI state related to events (e.g., selected tab)
import { create } from 'zustand';

const useEventsStore = create(set => ({
  activeTab: 'moments',
  setActiveTab: tab => set({ activeTab: tab }),
}));

export default useEventsStore;
