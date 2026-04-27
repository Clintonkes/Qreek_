import client from './client.js';

export const getPools    = ()       => client.get('/pools').then(r => r.data);
export const createPool  = (data)   => client.post('/pools', data).then(r => r.data);
export const joinPool    = (code)   => client.post('/pools/join', { invite_code: code }).then(r => r.data);
export const getPool     = (id)     => client.get(`/pools/${id}`).then(r => r.data);
