import { create } from 'zustand';

const useRatesStore = create(set => ({
  rates:      {},
  lastUpdate: null,

  setRates: (rates) => set({ rates, lastUpdate: new Date() }),
}));

export default useRatesStore;
