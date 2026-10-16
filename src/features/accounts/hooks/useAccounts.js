import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { accountsApi } from "../api/accountsApi";
import { errorMessage } from "../utils/format";

const KEY = "accounts";

/** Read hook: ["accounts", name, params] so every mutation can refresh the lot. */
const useRead = (name, fn, params, options = {}) =>
  useQuery({
    queryKey: [KEY, name, params ?? null],
    queryFn: () => fn(params),
    ...options,
  });

/**
 * Write hook. Every accounts mutation refreshes all accounts queries, which keeps
 * lists, totals and dashboards consistent without hand-wiring each one.
 */
const useWrite = (fn, { success, silent } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      if (success) toast.success(typeof success === "function" ? success(data, vars) : success);
    },
    onError: (error) => {
      if (!silent) toast.error(errorMessage(error));
    },
  });
};

export const useAccountsMeta = () =>
  useRead("meta", accountsApi.meta, null, { staleTime: 5 * 60 * 1000, retry: false });

export const useAccountSettings = () => useRead("settings", accountsApi.settings);
export const useSaveSettings = () => useWrite(accountsApi.saveSettings, { success: "Settings saved" });

export const useClientLookup = (enabled = true) =>
  useRead("lookup-clients", accountsApi.lookupClients, null, { enabled, staleTime: 5 * 60 * 1000 });
export const useEmployeeLookup = (enabled = true) =>
  useRead("lookup-employees", accountsApi.lookupEmployees, null, { enabled });

// Clients
export const useClients = (params) => useRead("clients", accountsApi.clients, params);
export const useClient = (id) => useRead("client", accountsApi.client, id, { enabled: !!id });
export const useSaveBilling = () =>
  useWrite(({ id, data }) => accountsApi.saveBilling(id, data), { success: "Billing details saved" });
export const useClientCosting = (id, params, enabled = true) =>
  useRead("client-costing", () => accountsApi.clientCosting(id, params), { id, ...params }, { enabled: !!id && enabled });

// Invoices
export const useInvoices = (params) => useRead("invoices", accountsApi.invoices, params, { placeholderData: (prev) => prev });
export const useInvoiceStats = () => useRead("invoice-stats", accountsApi.invoiceStats);
export const useInvoice = (id) => useRead("invoice", accountsApi.invoice, id, { enabled: !!id });
export const useCreateInvoice = () => useWrite(accountsApi.createInvoice, { success: "Invoice created" });
export const useUpdateInvoice = () =>
  useWrite(({ id, data }) => accountsApi.updateInvoice(id, data), { success: "Invoice updated" });
export const useDeleteInvoice = () => useWrite(accountsApi.deleteInvoice, { success: "Invoice deleted" });
export const useSendInvoice = () =>
  useWrite(({ id, data }) => accountsApi.sendInvoice(id, data), { success: "Invoice emailed" });
export const useMarkInvoiceSent = () => useWrite(accountsApi.markInvoiceSent, { success: "Marked as sent" });
export const useAddPayment = () =>
  useWrite(({ id, data }) => accountsApi.addPayment(id, data), { success: "Payment recorded" });
export const useRemovePayment = () =>
  useWrite(({ id, paymentId }) => accountsApi.removePayment(id, paymentId), { success: "Payment removed" });
export const useVoidInvoice = () =>
  useWrite(({ id, reason }) => accountsApi.voidInvoice(id, reason), { success: "Invoice voided" });
export const useSetInvoiceTemplate = () =>
  useWrite(({ id, templateId }) => accountsApi.setInvoiceTemplate(id, templateId), { success: "Template changed" });
export const useSetProposalTemplate = () =>
  useWrite(({ id, templateId }) => accountsApi.setProposalTemplate(id, templateId), { success: "Template changed" });
export const useDuplicateInvoice = () => useWrite(accountsApi.duplicateInvoice, { success: "Invoice duplicated" });
export const useSetRecurring = () =>
  useWrite(({ id, data }) => accountsApi.setRecurring(id, data), { success: "Recurring schedule saved" });
export const useRunRecurring = () => useWrite(accountsApi.runRecurring, { success: "Next invoice created" });

// Proposals
export const useProposals = (params) => useRead("proposals", accountsApi.proposals, params, { placeholderData: (prev) => prev });
export const useProposalStats = () => useRead("proposal-stats", accountsApi.proposalStats);
export const useProposal = (id) => useRead("proposal", accountsApi.proposal, id, { enabled: !!id });
export const useCreateProposal = () => useWrite(accountsApi.createProposal, { success: "Proposal created" });
export const useUpdateProposal = () =>
  useWrite(({ id, data }) => accountsApi.updateProposal(id, data), { success: "Proposal updated" });
export const useDeleteProposal = () => useWrite(accountsApi.deleteProposal, { success: "Proposal deleted" });
export const useSendProposal = () =>
  useWrite(({ id, data }) => accountsApi.sendProposal(id, data), { success: "Proposal emailed" });
export const useSetProposalStatus = () =>
  useWrite(({ id, data }) => accountsApi.setProposalStatus(id, data), { success: "Proposal updated" });
export const useDuplicateProposal = () => useWrite(accountsApi.duplicateProposal, { success: "New version created" });
export const useConvertProposal = () =>
  useWrite(({ id, data }) => accountsApi.convertProposal(id, data), { success: "Invoice created from proposal" });

// Expenses
export const useExpenses = (params) => useRead("expenses", accountsApi.expenses, params, { placeholderData: (prev) => prev });
export const useCreateExpense = () => useWrite(accountsApi.createExpense, { success: "Expense added" });
export const useUpdateExpense = () =>
  useWrite(({ id, data }) => accountsApi.updateExpense(id, data), { success: "Expense updated" });
export const useSetExpenseStatus = () =>
  useWrite(({ id, data }) => accountsApi.setExpenseStatus(id, data), { success: "Expense updated" });
export const useDeleteExpense = () => useWrite(accountsApi.deleteExpense, { success: "Expense deleted" });

// Payroll
export const useSalaries = () => useRead("salaries", accountsApi.salaries);
export const useSalary = (employeeId) => useRead("salary", accountsApi.salary, employeeId, { enabled: !!employeeId });
export const useSaveSalary = () =>
  useWrite(({ employeeId, data }) => accountsApi.saveSalary(employeeId, data), { success: "Salary saved" });
export const useRuns = () => useRead("runs", accountsApi.runs);
export const useRun = (id) => useRead("run", accountsApi.run, id, { enabled: !!id });
export const useCreateRun = () => useWrite(accountsApi.createRun, { success: "Payroll generated" });
export const useRegenerateRun = () => useWrite(accountsApi.regenerateRun, { success: "Payroll recalculated" });
export const useDeleteRun = () => useWrite(accountsApi.deleteRun, { success: "Payroll deleted" });
export const useApproveRun = () => useWrite(accountsApi.approveRun, { success: "Payroll approved. Employees can now see their payslips." });
export const usePayRun = () =>
  useWrite(({ id, data }) => accountsApi.payRun(id, data), { success: (d) => `${d.paid} payslip(s) marked paid` });
export const usePayslip = (id) => useRead("payslip", accountsApi.payslip, id, { enabled: !!id });
export const useUpdatePayslip = () =>
  useWrite(({ id, data }) => accountsApi.updatePayslip(id, data), { success: "Payslip updated" });
export const usePayPayslip = () =>
  useWrite(({ id, data }) => accountsApi.payPayslip(id, data), { success: "Payslip marked paid" });
export const useReleasePayslip = () => useWrite(accountsApi.releasePayslip, { success: "Payslip released" });
export const useMyPayslips = () => useRead("my-payslips", accountsApi.myPayslips);
export const useMyPayslip = (id) => useRead("my-payslip", accountsApi.myPayslip, id, { enabled: !!id });

// Reports
export const useDashboard = (params) => useRead("dashboard", accountsApi.dashboard, params, { placeholderData: (prev) => prev });
export const usePnl = (params) => useRead("pnl", accountsApi.pnl, params, { placeholderData: (prev) => prev });
export const useReceivables = () => useRead("receivables", accountsApi.receivables);
export const useGst = (params) => useRead("gst", accountsApi.gst, params, { placeholderData: (prev) => prev });
export const usePayrollReport = (params) => useRead("payroll-report", accountsApi.payrollReport, params, { placeholderData: (prev) => prev });
export const useExpenseReport = (params) => useRead("expense-report", accountsApi.expenseReport, params, { placeholderData: (prev) => prev });
export const useProfitability = (params) => useRead("profitability", accountsApi.profitability, params, { placeholderData: (prev) => prev });
