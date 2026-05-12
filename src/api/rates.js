import client from './client.js';

/**
 * Market rates API.
 * @param {string} fiat - The base fiat currency (default 'NGN').
 * @returns {Promise<Object>} A map of cryptocurrency rates.
 */
export const getRates    = (fiat = 'NGN') => client.get(`/rates?fiat=${fiat}`).then(r => r.data);

/**
 * Lists active price alerts for the user.
 * @returns {Promise<Object>} A list of alerts.
 */
export const getAlerts   = ()             => client.get('/alerts').then(r => r.data);

/**
 * Price alert creation API.
 * @param {Object} data - Alert details (currency, target_price, direction).
 * @returns {Promise<Object>} The created alert data.
 */
export const setAlert    = (data)         => client.post('/alerts', data).then(r => r.data);

/**
 * Alert deletion API.
 * @param {string} id - The ID of the alert to delete.
 * @returns {Promise<Object>} Success message.
 */
export const deleteAlert = (id)           => client.delete(`/alerts/${id}`).then(r => r.data);
