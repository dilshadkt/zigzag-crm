import apiClient from "../../../api/client";
import axios from "axios";

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false)
  );

const get = async (url, params) => (await apiClient.get(`/accounts${url}`, { params: clean(params) })).data;
const post = async (url, body) => (await apiClient.post(`/accounts${url}`, body || {})).data;
const put = async (url, body) => (await apiClient.put(`/accounts${url}`, body || {})).data;
const patch = async (url, body) => (await apiClient.patch(`/accounts${url}`, body || {})).data;
const del = async (url) => (await apiClient.delete(`/accounts${url}`)).data;

const origin = () => (typeof window !== "undefined" ? window.location.origin : "");

export const accountsApi = {
  meta: () => get("/meta"),
  settings: () => get("/settings"),
  saveSettings: (data) => put("/settings", data),
  lookupClients: () => get("/lookups/clients"),
  lookupEmployees: () => get("/lookups/employees"),

  clients: (params) => get("/clients", params),
  client: (id) => get(`/clients/${id}`),
  saveBilling: (id, data) => put(`/clients/${id}/billing`, data),
  clientCosting: (id, params) => get(`/clients/${id}/costing`, params),

  invoices: (params) => get("/invoices", params),
  invoiceStats: () => get("/invoices/stats"),
  invoice: (id) => get(`/invoices/${id}`),
  createInvoice: (data) => post("/invoices", data),
  updateInvoice: (id, data) => put(`/invoices/${id}`, data),
  deleteInvoice: (id) => del(`/invoices/${id}`),
  sendInvoice: (id, data) => post(`/invoices/${id}/send`, { ...data, baseUrl: origin() }),
  markInvoiceSent: (id) => post(`/invoices/${id}/mark-sent`),
  invoiceLink: (id) => get(`/invoices/${id}/share-link`, { baseUrl: origin() }),
  addPayment: (id, data) => post(`/invoices/${id}/payments`, data),
  removePayment: (id, paymentId) => del(`/invoices/${id}/payments/${paymentId}`),
  voidInvoice: (id, reason) => post(`/invoices/${id}/void`, { reason }),
  setInvoiceTemplate: (id, templateId) => patch(`/invoices/${id}/template`, { templateId }),
  setProposalTemplate: (id, templateId) => patch(`/proposals/${id}/template`, { templateId }),
  duplicateInvoice: (id) => post(`/invoices/${id}/duplicate`),
  setRecurring: (id, data) => put(`/invoices/${id}/recurring`, data),
  runRecurring: (id) => post(`/invoices/${id}/recurring/run`),

  proposals: (params) => get("/proposals", params),
  proposalStats: () => get("/proposals/stats"),
  proposal: (id) => get(`/proposals/${id}`),
  createProposal: (data) => post("/proposals", data),
  updateProposal: (id, data) => put(`/proposals/${id}`, data),
  deleteProposal: (id) => del(`/proposals/${id}`),
  sendProposal: (id, data) => post(`/proposals/${id}/send`, { ...data, baseUrl: origin() }),
  proposalLink: (id) => get(`/proposals/${id}/share-link`, { baseUrl: origin() }),
  setProposalStatus: (id, data) => patch(`/proposals/${id}/status`, data),
  duplicateProposal: (id) => post(`/proposals/${id}/duplicate`),
  convertProposal: (id, data) => post(`/proposals/${id}/convert`, data),

  expenses: (params) => get("/expenses", params),
  createExpense: (data) => post("/expenses", data),
  updateExpense: (id, data) => put(`/expenses/${id}`, data),
  setExpenseStatus: (id, data) => patch(`/expenses/${id}/status`, data),
  deleteExpense: (id) => del(`/expenses/${id}`),

  salaries: () => get("/payroll/salaries"),
  salary: (employeeId) => get(`/payroll/salaries/${employeeId}`),
  saveSalary: (employeeId, data) => put(`/payroll/salaries/${employeeId}`, data),
  runs: () => get("/payroll/runs"),
  run: (id) => get(`/payroll/runs/${id}`),
  createRun: (month) => post("/payroll/runs", { month }),
  regenerateRun: (id) => post(`/payroll/runs/${id}/regenerate`),
  deleteRun: (id) => del(`/payroll/runs/${id}`),
  approveRun: (id) => post(`/payroll/runs/${id}/approve`),
  payRun: (id, data) => post(`/payroll/runs/${id}/pay`, data),
  payslip: (id) => get(`/payroll/payslips/${id}`),
  updatePayslip: (id, data) => patch(`/payroll/payslips/${id}`, data),
  payPayslip: (id, data) => post(`/payroll/payslips/${id}/pay`, data),
  releasePayslip: (id) => post(`/payroll/payslips/${id}/release`),
  bankSheet: (month) => get("/payroll/bank-sheet", { month }),

  myPayslips: () => get("/my-payslips"),
  myPayslip: (id) => get(`/my-payslips/${id}`),

  dashboard: (params) => get("/reports/dashboard", params),
  pnl: (params) => get("/reports/pnl", params),
  receivables: () => get("/reports/receivables"),
  gst: (params) => get("/reports/gst", params),
  payrollReport: (params) => get("/reports/payroll", params),
  expenseReport: (params) => get("/reports/expenses", params),
  profitability: (params) => get("/reports/profitability", params),
};

// Public share links use no auth header, so they bypass the signed-in client
const publicBase = () =>
  apiClient.defaults.baseURL.replace(/\/$/, "") + "/public/accounts";

export const publicApi = {
  view: async (type, token) => (await axios.get(`${publicBase()}/${type}/${token}`)).data,
  respond: async (token, data) => (await axios.post(`${publicBase()}/proposal/${token}/respond`, data)).data,
};
