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

/**
 * Initiates a card-save via a ₦50 verification charge.
 * Returns { status: 'success'|'pin'|'otp'|'redirect', ... }
 * @param {{ card_number, cvv, expiry_month, expiry_year, pin? }} d
 */
export const addCard = (d) => client.post('/cards/add', d).then(r => r.data);

/**
 * Submits the OTP step-up from addCard and saves the card.
 * @param {{ flw_ref, otp }} d
 */
export const validateAddCardOtp = (d) => client.post('/cards/add/validate', d).then(r => r.data);
