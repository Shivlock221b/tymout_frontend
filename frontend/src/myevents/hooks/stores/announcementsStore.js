// announcementsStore.js
// Zustand store for announcements UI state (if needed, e.g., selected announcement)
import create from 'zustand';

const useAnnouncementsStore = create(set => ({
  selectedAnnouncementId: null,
  setSelectedAnnouncementId: id => set({ selectedAnnouncementId: id }),
}));

export default useAnnouncementsStore;
