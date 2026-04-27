import client from './client.js';

export const getCompany        = ()      => client.get('/payroll/company').then(r => r.data);
export const createCompany     = (d)     => client.post('/payroll/company', d).then(r => r.data);
export const updateCompany     = (d)     => client.put('/payroll/company', d).then(r => r.data);

export const getEmployees      = (p)     => client.get('/payroll/employees', { params: p }).then(r => r.data);
export const addEmployee       = (d)     => client.post('/payroll/employees', d).then(r => r.data);
export const bulkAddEmployees  = (d)     => client.post('/payroll/employees/bulk', d).then(r => r.data);
export const updateEmployee    = (id, d) => client.put(`/payroll/employees/${id}`, d).then(r => r.data);
export const removeEmployee    = (id)    => client.delete(`/payroll/employees/${id}`).then(r => r.data);
export const getDepartments    = ()      => client.get('/payroll/departments').then(r => r.data);

export const getPayrollRuns    = ()      => client.get('/payroll/runs').then(r => r.data);
export const createPayrollRun  = (d)     => client.post('/payroll/runs', d).then(r => r.data);
export const getPayrollRun     = (id)    => client.get(`/payroll/runs/${id}`).then(r => r.data);
export const executePayrollRun = (id, d) => client.post(`/payroll/runs/${id}/execute`, d).then(r => r.data);
export const cancelPayrollRun  = (id)    => client.delete(`/payroll/runs/${id}`).then(r => r.data);

export const getAnalytics      = ()      => client.get('/payroll/analytics').then(r => r.data);
export const getBanks          = ()      => client.get('/payroll/banks').then(r => r.data);
