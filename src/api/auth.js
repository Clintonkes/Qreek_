import client from './client.js';

/**
 * Registration API.
 * @param {Object} data - User registration details (name, email, phone, password, referral_code).
 * @returns {Promise<Object>} The registered user data and initial tokens.
 */
export const register = (data) => client.post('/auth/register', data).then(r => r.data);

/**
 * Fast phone-availability check, used right after the identity step of registration
 * so a duplicate number is caught before the user goes on to set a PIN.
 * @param {string} phone - Phone number to check (any format; normalized server-side).
 * @returns {Promise<{available: boolean}>}
 */
export const checkPhoneAvailable = (phone) =>
  client.get('/auth/check-phone', { params: { phone } }).then(r => r.data);

/**
 * Login API.
 * @param {Object} data - Login credentials (phone, password).
 * @returns {Promise<Object>} The authenticated user data and tokens.
 */
export const login    = (data) => client.post('/auth/login',    data).then(r => r.data);

/**
 * Token refresh API.
 * @param {string} refreshToken - The current refresh token.
 * @returns {Promise<Object>} New access and refresh tokens.
 */
export const refresh  = (refreshToken) => client.post('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data);

/**
 * Logout session API.
 * @returns {Promise<Object>} Success message.
 */
export const logoutSession = () => client.post('/auth/logout').then(r => r.data);

/**
 * Current user profile API.
 * @returns {Promise<Object>} The profile data of the currently authenticated user.
 */
export const me       = ()     => client.get('/auth/me').then(r => r.data);

/**
 * PIN update API.
 * @param {Object} data - Old and new PIN details.
 * @returns {Promise<Object>} Success message.
 */
export const changePin = (data) => client.post('/auth/change-pin', data).then(r => r.data);

export const hasPin     = ()     => client.get('/auth/has-pin').then(r => r.data);

export const setPin     = (data) => client.post('/auth/set-pin', data).then(r => r.data);

/**
 * Bank details update API.
 * @param {Object} data - Bank account and code.
 * @returns {Promise<Object>} The updated user record.
 */
export const saveBank  = (data) => client.post('/auth/save-bank',  data).then(r => r.data);

/**
 * Supported banks list API.
 * @returns {Promise<Object>} A list of banks for withdrawal and deposits.
 */
export const listBanks = ()     => client.get('/auth/banks').then(r => r.data);

/**
 * Public user profile — returns name and active standalone payment links for a given referral code.
 * No auth required.
 * @param {string} referralCode - The user's referral/public code.
 * @returns {Promise<Object>} { name, referral_code, links }
 */
export const getUserProfile = (referralCode) =>
  client.get(`/auth/profile/${referralCode.toUpperCase()}`).then(r => r.data);
