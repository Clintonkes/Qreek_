import client from './client.js';

export const getFamilies = () => client.get('/family').then(r => r.data);
export const createFamily = (d) => client.post('/family', d).then(r => r.data);
export const joinFamily = (inviteCode) => client.post('/family/join', { invite_code: inviteCode }).then(r => r.data);
export const getFamily = (familyId) => client.get(`/family/${familyId}`).then(r => r.data);
export const getFamilyLedger = (familyId, page = 1, perPage = 25) =>
  client.get(`/family/${familyId}/ledger?page=${page}&per_page=${perPage}`).then(r => r.data);
export const createFamilyRequest = (familyId, d) => client.post(`/family/${familyId}/requests`, d).then(r => r.data);
export const approveFamilyRequest = (familyId, requestId) => client.post(`/family/${familyId}/requests/${requestId}/approve`).then(r => r.data);
export const createFamilyTransfer = (familyId, d) => client.post(`/family/${familyId}/transfers`, d).then(r => r.data);
export const completeFamilyTransfer = (familyId, transferId) => client.post(`/family/${familyId}/transfers/${transferId}/complete`).then(r => r.data);
