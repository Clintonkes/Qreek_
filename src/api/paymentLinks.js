import client from './client.js';

/**
 * Payment Link creation API.
 * @param {Object} d - Link details (title, description, amount, bank account).
 * @returns {Promise<Object>} The created link data.
 */
export const createLink  = (d)      => client.post('/payment-links', d).then(r => r.data);

/**
 * Lists all payment links created by the current user.
 * @returns {Promise<Object>} A list of payment links.
 */
export const getLinks    = ()       => client.get('/payment-links').then(r => r.data);

/**
 * Verifies a Nigerian bank account before creating or updating a link.
 * @param {Object} d - Bank details (bank_code, bank_account).
 * @returns {Promise<Object>} The resolved account name/details.
 */
export const verifyBankAccount = (d) => client.post('/payment-links/verify-bank', d).then(r => r.data);

/**
 * Public link resolution API.
 * @param {string} code - The unique code of the payment link.
 * @returns {Promise<Object>} The resolved link details.
 */
export const resolveLink = (code)   => client.get(`/payment-links/resolve/${code}`).then(r => r.data);

/**
 * Payment processing API for links.
 * @param {string} code - The unique code of the payment link.
 * @param {Object} d - Payment details (amount, payer info, PIN).
 * @returns {Promise<Object>} The payment confirmation and reference.
 */
export const payLink     = (code, d)=> client.post(`/payment-links/pay/${code}`, d).then(r => r.data);

/**
 * Confirms a Flutterwave checkout redirect or webhook-backed payment.
 * The backend must verify tx_ref, transaction_id, amount, currency, and status
 * against Flutterwave before marking the Qreek ledger entry as paid.
 * @param {string} code - The payment link code.
 * @param {Object} d - Flutterwave redirect details.
 * @returns {Promise<Object>} Verified payment record.
 */
export const confirmFlutterwaveLinkPayment = (code, d) =>
  client.post(`/payment-links/pay/${code}/flutterwave/confirm`, d).then(r => r.data);

/**
 * Reads the current collection and recipient payout status for a public link payment.
 * @param {string} code - The payment link code.
 * @param {string} txRef - The Qreek/Flutterwave transaction reference.
 * @returns {Promise<Object>} Current payment and payout state.
 */
export const getLinkPaymentStatus = (code, txRef) =>
  client.get(`/payment-links/pay/${code}/status/${txRef}`).then(r => r.data);

/**
 * Link deactivation API.
 * @param {string} id - The ID of the payment link to delete/deactivate.
 * @returns {Promise<Object>} Success message.
 */
export const deleteLink  = (id)     => client.delete(`/payment-links/${id}`).then(r => r.data);

/**
 * Link update API (edit title, description, amount, or bank details).
 * Editing bank details will recreate the subaccount for correct splits.
 * @param {string} id - The ID of the payment link.
 * @param {Object} d - Updated fields.
 * @returns {Promise<Object>} The updated link data.
 */
export const updateLink  = (id, d)  => client.put(`/payment-links/${id}`, d).then(r => r.data);

/**
 * Debug payment events for a link (to inspect splits, settled amounts, fees).
 * @param {string} reference - Link code or id.
 * @returns {Promise<Object>} Events including verify payloads with provider_settled_amount (Qreek fee) and sub splits.
 */
export const getLinkEvents = (reference) => client.get(`/payment-links/debug/events/${reference}`).then(r => r.data);

/**
 * List settlements/payments for a specific link (used by Settlements button).
 * Paginated, 10 per page by default.
 * @param {string} linkId
 * @param {number} page
 */
export const getLinkSettlements = (linkId, page = 1) =>
  client.get(`/payment-links/${linkId}/settlements?page=${page}`).then(r => r.data);
