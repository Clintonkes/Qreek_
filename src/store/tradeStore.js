import { create } from 'zustand';

const useTradeStore = create(set => ({
  messages: [],
  step:     'idle',
  pending:  null,

  addMessage: (msg) =>
    set(s => ({ messages: [...s.messages, { ...msg, id: Date.now() + Math.random() }] })),

  setStep: (step, pending = null) => set({ step, pending }),

  reset: () => set({ messages: [], step: 'idle', pending: null }),

  clearMessages: () => set({ messages: [] }),
}));

export default useTradeStore;
