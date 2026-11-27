import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { accountsApi } from "../api/accountsApi";
import { errorMessage, kindNoun } from "../utils/format";

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

// Clients added here that are not projects
export const useAccountClients = (params, enabled = true) =>
  useRead("account-clients", accountsApi.accountClients, params, { enabled, placeholderData: (prev) => prev });
export const useCreateAccountClient = () => useWrite(accountsApi.createAccountClient, { success: "Client added" });
export const useUpdateAccountClient = () =>
  useWrite(({ id, data }) => accountsApi.updateAccountClient(id, data), { success: "Client updated" });
export const useDeleteAccountClient = () => useWrite(accountsApi.deleteAccountClient, { success: "Client deleted" });

// Invoices
export const useInvoices = (params, enabled = true) =>
  useRead("invoices", accountsApi.invoices, params, { enabled, placeholderData: (prev) => prev });
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
export const useExpenseDescriptions = (enabled = true) =>
  useRead("expense-descriptions", accountsApi.expenseDescriptions, null, { enabled, staleTime: 60 * 1000 });
export const useCreateExpense = () => useWrite(accountsApi.createExpense, { success: (d) => `${kindNoun(d.expense)} added` });
export const useUpdateExpense = () =>
  useWrite(({ id, data }) => accountsApi.updateExpense(id, data), { success: (d) => `${kindNoun(d.expense)} updated` });
export const useSetExpenseStatus = () =>
  useWrite(({ id, data }) => accountsApi.setExpenseStatus(id, data), { success: (d) => `${kindNoun(d.expense)} updated` });
export const useDeleteExpense = () => useWrite(accountsApi.deleteExpense, { success: "Deleted" });
export const useAddExpenseCategory = () => useWrite(accountsApi.addExpenseCategory, { success: "Category added" });
export const useRemoveExpenseCategory = () => useWrite(accountsApi.removeExpenseCategory, { success: "Category removed" });

// Payments to and from parties (money in / out)
export const usePayments = (params) => useRead("payments", accountsApi.payments, params, { placeholderData: (prev) => prev });
// payee: { vendor } or { staff }, or null
export const useOpenExpenses = (payee, enabled = true) =>
  useRead("open-expenses", accountsApi.openExpenses, payee, { enabled: !!payee && enabled });
export const useExpense = (id) => useRead("expense", accountsApi.expense, id, { enabled: !!id });

// The item list
export const useItems = (params, enabled = true) =>
  useRead("items", accountsApi.items, params, { enabled, placeholderData: (prev) => prev });
export const useCreateItem = () => useWrite(accountsApi.createItem, { success: "Item added" });
export const useUpdateItem = () =>
  useWrite(({ id, data }) => accountsApi.updateItem(id, data), { success: "Item updated" });
export const useDeleteItem = () => useWrite(accountsApi.deleteItem, { success: "Item deleted" });

// Staff. People are added on the Employees page, so these reload when opened.
export const useStaff = () => useRead("staff", accountsApi.staff, null, { refetchOnMount: "always" });
export const useStaffMember = (id) => useRead("staff-member", accountsApi.staffMember, id, { enabled: !!id, refetchOnMount: "always" });
export const useStaffVendorMatches = (enabled = true) =>
  useRead("staff-matches", accountsApi.staffVendorMatches, null, { enabled, refetchOnMount: "always" });
export const useMoveVendorToStaff = () =>
  useWrite(({ id, vendorId }) => accountsApi.moveVendorToStaff(id, vendorId), { success: (d) => `Moved to ${d.staff.name}` });
export const useCreatePayment = () => useWrite(accountsApi.createPayment, { success: "Payment recorded" });
export const useDeletePayment = () => useWrite(accountsApi.deletePayment, { success: "Payment deleted" });

// Assets the company bought, with their depreciation
export const useAssets = (params) => useRead("assets", accountsApi.assets, params, { placeholderData: (prev) => prev });
export const useAssetSchedule = (id) => useRead("asset-schedule", accountsApi.assetSchedule, id, { enabled: !!id });

// Vendors
export const useVendors = (params, enabled = true) =>
  useRead("vendors", accountsApi.vendors, params, { enabled, placeholderData: (prev) => prev });
export const useCreateVendor = () => useWrite(accountsApi.createVendor, { success: "Vendor added" });
export const useUpdateVendor = () =>
  useWrite(({ id, data }) => accountsApi.updateVendor(id, data), { success: "Vendor updated" });
export const useDeleteVendor = () => useWrite(accountsApi.deleteVendor, { success: "Vendor deleted" });

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
  useWrite(({ id, data }) => accountsApi.payPayslip(id, data), {
    success: (d) => (d.payslip?.status === "paid" ? "Payslip marked paid" : "Part payment recorded"),
  });
export const useRemovePayslipPayment = () =>
  useWrite(({ id, paymentId }) => accountsApi.removePayslipPayment(id, paymentId), { success: "Payment removed" });
export const useReleasePayslip = () => useWrite(accountsApi.releasePayslip, { success: "Payslip released" });
export const useAdvances = (params) => useRead("advances", accountsApi.advances, params, { placeholderData: (prev) => prev });
export const useCreateAdvance = () => useWrite(accountsApi.createAdvance, { success: "Advance recorded" });
export const useUpdateAdvance = () =>
  useWrite(({ id, data }) => accountsApi.updateAdvance(id, data), { success: "Advance updated" });
export const useDeleteAdvance = () => useWrite(accountsApi.deleteAdvance, { success: "Advance deleted" });
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
// Course fees are recorded outside Accounts, so these reload each time they are opened
export const useCashBook = (book, params) =>
  useRead(`${book}-report`, (p) => accountsApi.cashBook(book, p), params, { placeholderData: (prev) => prev, refetchOnMount: "always" });
