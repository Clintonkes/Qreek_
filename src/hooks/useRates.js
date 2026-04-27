import { useEffect } from 'react';
import { getRates } from '../api/rates.js';
import useRatesStore from '../store/ratesStore.js';

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
