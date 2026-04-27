import client from './client.js';

export const getRates    = (fiat = 'NGN') => client.get(`/rates?fiat=${fiat}`).then(r => r.data);
