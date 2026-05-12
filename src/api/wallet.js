import client from './client.js';

/**
 * User balances API.
 * @returns {Promise<Object>} The user's balances in all supported currencies.
 */
export const getBalances      = ()             => client.get('/wallet/balances').then(r => r.data);

/**
 * Paginated transaction history API.
 * @param {number} page - The page number to retrieve.
 * @returns {Promise<Object>} A list of past transactions.
 */
export const getHistory       = (page = 1)     => client.get(`/wallet/history?page=${page}&limit=20`).then(r => r.data);

/**
 * Total portfolio value API.
 * @returns {Promise<Object>} The total estimated value of the user's holdings in NGN.
 */
export const getPortfolioValue = ()            => client.get('/wallet/portfolio-value').then(r => r.data);
