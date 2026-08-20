import client from './client.js';

/**
 * Lists the current user's saved cards (masked — brand, last 4, expiry only).
 * @returns {Promise<Object>} { cards: [...] }
 */
export const getSavedCards = () => client.get('/cards').then(r => r.data);

/**
 * Removes a saved card.
 * @param {string} cardId
 */
export const deleteSavedCard = (cardId) => client.delete(`/cards/${cardId}`).then(r => r.data);

/**
 * Marks a saved card as the default for one-tap checkout.
 * @param {string} cardId
 */
export const setDefaultCard = (cardId) => client.put(`/cards/${cardId}/default`).then(r => r.data);
