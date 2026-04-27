import client from './client.js';

export const createLink  = (d)      => client.post('/payment-links', d).then(r => r.data);
export const getLinks    = ()       => client.get('/payment-links').then(r => r.data);
export const resolveLink = (code)   => client.get(`/payment-links/resolve/${code}`).then(r => r.data);
export const payLink     = (code, d)=> client.post(`/payment-links/pay/${code}`, d).then(r => r.data);
export const deleteLink  = (id)     => client.delete(`/payment-links/${id}`).then(r => r.data);
