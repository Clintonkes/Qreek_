import client from './client.js';

export const getBalances      = ()             => client.get('/wallet/balances').then(r => r.data);
export const getHistory       = (page = 1)     => client.get(`/wallet/history?page=${page}&limit=20`).then(r => r.data);
export const getPortfolioValue = ()            => client.get('/wallet/portfolio-value').then(r => r.data);
