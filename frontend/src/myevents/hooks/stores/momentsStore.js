// momentsStore.js
// Zustand store for moments UI state (if needed, e.g., selected photo)
import create from 'zustand';

const useMomentsStore = create(set => ({
  selectedPhotoIndex: null,
  setSelectedPhotoIndex: idx => set({ selectedPhotoIndex: idx }),
}));

export default useMomentsStore;
