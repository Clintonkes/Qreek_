import client from './client.js';

export const getRates    = (fiat = 'NGN') => client.get(`/rates?fiat=${fiat}`).then(r => r.data);
export const getAlerts   = ()             => client.get('/alerts').then(r => r.data);
export const setAlert    = (data)         => client.post('/alerts', data).then(r => r.data);
export const deleteAlert = (id)           => client.delete(`/alerts/${id}`).then(r => r.data);
