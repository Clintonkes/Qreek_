import client from './client.js';

/**
 * Market rates API.
 * @param {string} fiat - The base fiat currency (default 'NGN').
 * @returns {Promise<Object>} A map of cryptocurrency rates.
 */
export const getRates    = (fiat = 'NGN') => client.get(`/rates?fiat=${fiat}`).then(r => r.data);
