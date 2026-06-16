import client from './client.js';

/**
 * Company profile API for payroll.
 * @returns {Promise<Object>} The company's payroll profile.
 */
export const getCompany        = ()      => client.get('/payroll/company').then(r => r.data);

/**
 * Company profile creation API.
 * @param {Object} d - Company details (name, email, sector, logo_url).
 * @returns {Promise<Object>} The created company profile.
 */
export const createCompany     = (d)     => client.post('/payroll/company', d).then(r => r.data);

/**
 * Company profile update API.
 * @param {Object} d - Updated company details.
 * @returns {Promise<Object>} The updated company profile.
 */
export const updateCompany     = (d)     => client.put('/payroll/company', d).then(r => r.data);

/**
 * Employee list API.
 * @param {Object} p - Query parameters (department, search, page).
 * @returns {Promise<Object>} A list of employees.
 */
export const getEmployees      = (p)     => client.get('/payroll/employees', { params: p }).then(r => r.data);

/**
 * Single employee creation API.
 * @param {Object} d - Employee details (name, email, phone, salary, etc.).
 * @returns {Promise<Object>} The created employee record.
 */
export const addEmployee       = (d)     => client.post('/payroll/employees', d).then(r => r.data);

/**
 * Bulk employee creation API.
 * @param {Array<Object>} d - A list of employee records.
 * @returns {Promise<Object>} Success message and number of added employees.
 */
export const bulkAddEmployees  = (d)     => client.post('/payroll/employees/bulk', d).then(r => r.data);

/**
 * Employee record update API.
 * @param {string} id - The ID of the employee.
 * @param {Object} d - Updated employee details.
 * @returns {Promise<Object>} The updated employee record.
 */
export const updateEmployee    = (id, d) => client.put(`/payroll/employees/${id}`, d).then(r => r.data);

/**
 * Employee removal API.
 * @param {string} id - The ID of the employee to delete.
 * @returns {Promise<Object>} Success message.
 */
export const removeEmployee    = (id)    => client.delete(`/payroll/employees/${id}`).then(r => r.data);

/**
 * List of departments within the company.
 * @returns {Promise<Object>} A list of department names.
 */
export const getDepartments    = ()      => client.get('/payroll/departments').then(r => r.data);

/**
 * List of all payroll runs.
 * @returns {Promise<Object>} A list of historical and draft payroll runs.
 */
export const getPayrollRuns    = ()      => client.get('/payroll/runs').then(r => r.data);

/**
 * Payroll run creation (batch disbursement setup) API.
 * @param {Object} d - Run details (title, type, employee_ids).
 * @returns {Promise<Object>} The created payroll run (draft).
 */
export const createPayrollRun  = (d)     => client.post('/payroll/runs', d).then(r => r.data);

/**
 * Detailed payroll run information API.
 * @param {string} id - The ID of the payroll run.
 * @returns {Promise<Object>} Detailed run information and individual payout status.
 */
export const getPayrollRun     = (id)    => client.get(`/payroll/runs/${id}`).then(r => r.data);

/**
 * Payroll execution API (triggers disbursement).
 * @param {string} id - The ID of the payroll run.
 * @param {Object} d - PIN confirmation.
 * @returns {Promise<Object>} Success message and run status.
 */
export const executePayrollRun = (id, d) => client.post(`/payroll/runs/${id}/execute`, d).then(r => r.data);

/**
 * Payroll run cancellation (for draft runs) API.
 * @param {string} id - The ID of the payroll run to cancel.
 * @returns {Promise<Object>} Success message.
 */
export const cancelPayrollRun  = (id)    => client.delete(`/payroll/runs/${id}`).then(r => r.data);

/**
 * Retry a single failed payroll entry.
 * @param {string} runId - The payroll run ID.
 * @param {string} entryId - The payroll entry ID to retry.
 * @returns {Promise<Object>} Result with updated entry.
 */
export const retryPayrollEntry = (runId, entryId) => client.post(`/payroll/runs/${runId}/entries/${entryId}/retry`).then(r => r.data);

/**
 * Retry all failed entries in a payroll run.
 * @param {string} runId - The payroll run ID.
 * @returns {Promise<Object>} Summary of retry results.
 */
export const retryAllFailed     = (runId) => client.post(`/payroll/runs/${runId}/retry-failed`).then(r => r.data);

/**
 * Payroll analytics API.
 * @returns {Promise<Object>} Spending summaries, employee counts, and trends.
 */
export const getAnalytics      = ()      => client.get('/payroll/analytics').then(r => r.data);

/**
 * Company wallet deposit API - creates a Flutterwave checkout URL.
 * @param {Object} d - { amount: number }
 * @returns {Promise<Object>} { checkout_url, reference, message }
 */
export const depositToWallet   = (d)     => client.post('/payroll/wallet/deposit', d).then(r => r.data);

/**
 * Get company wallet balance.
 * @returns {Promise<Object>} { wallet_balance_ngn }
 */
export const getWalletBalance  = ()      => client.get('/payroll/wallet/balance').then(r => r.data);

/**
 * Export payroll run as CSV.
 * @param {string} id - The payroll run ID.
 * @returns {Promise<Blob>} CSV file blob.
 */
export const exportRunCsv      = (id)    => client.get(`/payroll/runs/${id}/export`, { responseType: 'blob' }).then(r => r.data);

/**
 * Get payslip for a single entry.
 * @param {string} runId - The payroll run ID.
 * @param {string} entryId - The payroll entry ID.
 * @returns {Promise<Object>} Payslip data.
 */
export const getPayslip        = (runId, entryId) => client.get(`/payroll/runs/${runId}/entries/${entryId}/payslip`).then(r => r.data);

/**
 * Supported banks list for payroll disbursements.
 * @returns {Promise<Object>} A list of banks.
 */
export const getBanks          = ()      => client.get('/payroll/banks').then(r => r.data);
