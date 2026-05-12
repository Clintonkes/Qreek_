import client from './client.js';

/**
 * Lists all pools the user is a member of.
 * @returns {Promise<Object>} A list of pools.
 */
export const getPools        = ()         => client.get('/pools').then(r => r.data);

/**
 * Pool creation API.
 * @param {Object} data - Pool name and type.
 * @returns {Promise<Object>} The created pool data.
 */
export const createPool      = (data)     => client.post('/pools', data).then(r => r.data);

/**
 * Pool join API.
 * @param {string} code - The invite code for the pool.
 * @returns {Promise<Object>} Success message and pool ID.
 */
export const joinPool        = (code)     => client.post('/pools/join', { invite_code: code }).then(r => r.data);

/**
 * Detailed pool information API.
 * @param {string} id - The ID of the pool.
 * @returns {Promise<Object>} Detailed pool information and member list.
 */
export const getPool         = (id)       => client.get(`/pools/${id}`).then(r => r.data);

/**
 * Pool payout API.
 * @param {string} id - The ID of the pool.
 * @param {Object} data - Payment details (amount, recipient, PIN).
 * @returns {Promise<Object>} The payment confirmation.
 */
export const poolSend        = (id, data) => client.post(`/pools/${id}/send`, data).then(r => r.data);

/**
 * Paginated pool activity API.
 * @param {string} id - The ID of the pool.
 * @param {number} page - The page number.
 * @returns {Promise<Object>} A list of transactions within the pool.
 */
export const getPoolActivity = (id, page) => client.get(`/pools/${id}/activity?page=${page || 1}`).then(r => r.data);

/**
 * Pool payment request creation API.
 * @param {string} id - The ID of the pool.
 * @param {Object} data - Request details (title, amount, note).
 * @returns {Promise<Object>} The created request data.
 */
export const createRequest   = (id, data) => client.post(`/pools/${id}/requests`, data).then(r => r.data);

/**
 * Pool active payment requests API.
 * @param {string} id - The ID of the pool.
 * @returns {Promise<Object>} A list of active requests.
 */
export const getRequests     = (id)       => client.get(`/pools/${id}/requests`).then(r => r.data);

// Pool protection
export const reportDispute   = (id, data) => client.post(`/pools/${id}/dispute`, data).then(r => r.data);
export const transferAdmin   = (id, phone)=> client.post(`/pools/${id}/admin/transfer?new_phone=${encodeURIComponent(phone)}`).then(r => r.data);
