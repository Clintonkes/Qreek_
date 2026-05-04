import client from './client.js';

export const register = (data) => client.post('/auth/register', data).then(r => r.data);
export const login    = (data) => client.post('/auth/login',    data).then(r => r.data);
export const refresh  = (refreshToken) => client.post('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data);
export const logoutSession = () => client.post('/auth/logout').then(r => r.data);
export const me       = ()     => client.get('/auth/me').then(r => r.data);
export const changePin = (data) => client.post('/auth/change-pin', data).then(r => r.data);
export const saveBank  = (data) => client.post('/auth/save-bank',  data).then(r => r.data);
export const listBanks = ()     => client.get('/auth/banks').then(r => r.data);
