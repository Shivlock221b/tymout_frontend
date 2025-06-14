// membersStore.js
// Zustand store for members UI state (if needed, e.g., selected member)
import create from 'zustand';

const useMembersStore = create(set => ({
  selectedMemberId: null,
  setSelectedMemberId: id => set({ selectedMemberId: id }),
}));

export default useMembersStore;
