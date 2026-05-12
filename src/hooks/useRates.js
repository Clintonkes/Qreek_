import { useEffect } from 'react';
import { getRates } from '../api/rates.js';
import useRatesStore from '../store/ratesStore.js';

/**
 * Custom hook for periodic fetching of market exchange rates.
 * Automatically updates the global rates store at a specified interval.
 *
 * @param {number} [interval=30000] - The frequency of updates in milliseconds (default 30 seconds).
 */
export function useRates(interval = 30000) {
  const setRates = useRatesStore(s => s.setRates);

  useEffect(() => {
    let alive = true;
    const fetch = () => {
      getRates().then(data => { if (alive) setRates(data.rates || {}); }).catch(() => {});
    };
    fetch();
    const id = setInterval(fetch, interval);
    return () => { alive = false; clearInterval(id); };
  }, [interval]);
}
