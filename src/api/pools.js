import client from './client.js';

export const getPools        = ()         => client.get('/pools').then(r => r.data);
export const createPool      = (data)     => client.post('/pools', data).then(r => r.data);
export const joinPool        = (code)     => client.post('/pools/join', { invite_code: code }).then(r => r.data);
export const getPool         = (id)       => client.get(`/pools/${id}`).then(r => r.data);
export const poolSend        = (id, data) => client.post(`/pools/${id}/send`, data).then(r => r.data);
export const getPoolActivity = (id, page) => client.get(`/pools/${id}/activity?page=${page || 1}`).then(r => r.data);
export const createRequest   = (id, data) => client.post(`/pools/${id}/requests`, data).then(r => r.data);
export const getRequests     = (id)       => client.get(`/pools/${id}/requests`).then(r => r.data);
