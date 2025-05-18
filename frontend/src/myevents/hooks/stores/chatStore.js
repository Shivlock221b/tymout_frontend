// chatStore.js
// Zustand store for chat UI state (e.g., input text)
import { create } from 'zustand';

const useChatStore = create(set => ({
  inputText: '',
  setInputText: inputText => set({ inputText }),
}));

export default useChatStore;
