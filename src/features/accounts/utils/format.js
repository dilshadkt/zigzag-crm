export const fmtMoney = (value, symbol = "₹") => {
  const n = Number(value) || 0;
  const sign = n < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** ₹1.25 L, ₹2.40 Cr, ₹12.5 K: compact amounts for tiles and chart axes. */
export const fmtCompact = (value, symbol = "₹") => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const trim = (x) => String(Number(x.toFixed(2)));
  if (abs >= 1e7) return `${sign}${symbol}${trim(abs / 1e7)} Cr`;
  if (abs >= 1e5) return `${sign}${symbol}${trim(abs / 1e5)} L`;
  if (abs >= 1e3) return `${sign}${symbol}${trim(abs / 1e3)} K`;
  return `${sign}${symbol}${trim(abs)}`;
};

export const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** yyyy-mm-dd in local time, for <input type="date"> */
export const toInputDate = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const monthLabel = (key, long = false) => {
  if (!key) return "";
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: long ? "long" : "short",
    year: long ? "numeric" : "2-digit",
  });
};

export const currentMonthKey = () => toInputDate(new Date()).slice(0, 7);

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const belowThousand = (n) => {
  let out = "";
  if (n >= 100) {
    out += `${ONES[Math.floor(n / 100)]} Hundred`;
    n %= 100;
    if (n) out += " ";
  }
  if (n >= 20) {
    out += TENS[Math.floor(n / 10)];
    if (n % 10) out += ` ${ONES[n % 10]}`;
  } else if (n > 0) {
    out += ONES[n];
  }
  return out;
};

/** 1,23,456.50 -> "One Lakh Twenty Three Thousand Four Hundred Fifty Six Rupees and Fifty Paise Only" */
export const amountInWords = (amount, currency = "INR") => {
  const value = Math.abs(Number(amount) || 0);
  let rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  if (rupees === 0 && paise === 0) return currency === "INR" ? "Zero Rupees Only" : "Zero Only";

  const parts = [];
  const crore = Math.floor(rupees / 1e7);
  rupees %= 1e7;
  const lakh = Math.floor(rupees / 1e5);
  rupees %= 1e5;
  const thousand = Math.floor(rupees / 1e3);
  rupees %= 1e3;
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rupees) parts.push(belowThousand(rupees));

  const major = currency === "INR" ? "Rupees" : currency;
  const minor = currency === "INR" ? "Paise" : "Cents";
  let words = parts.join(" ") || "Zero";
  words += ` ${major}`;
  if (paise) words += ` and ${belowThousand(paise)} ${minor}`;
  return `${words} Only`;
};

export const INVOICE_STATUS = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", cls: "bg-blue-50 text-blue-600" },
  partially_paid: { label: "Partially paid", cls: "bg-amber-50 text-amber-700" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-600" },
  void: { label: "Void", cls: "bg-slate-100 text-slate-400 line-through" },
};

export const PROPOSAL_STATUS = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", cls: "bg-blue-50 text-blue-600" },
  viewed: { label: "Viewed", cls: "bg-violet-50 text-violet-600" },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700" },
  declined: { label: "Declined", cls: "bg-red-50 text-red-600" },
  expired: { label: "Expired", cls: "bg-amber-50 text-amber-700" },
  converted: { label: "Invoiced", cls: "bg-emerald-50 text-emerald-700" },
};

export const EXPENSE_STATUS = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", cls: "bg-blue-50 text-blue-600" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600" },
};

export const PAYSLIP_STATUS = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600" },
  hold: { label: "On hold", cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", cls: "bg-blue-50 text-blue-600" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700" },
};

export const RUN_STATUS = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600" },
  approved: { label: "Approved", cls: "bg-blue-50 text-blue-600" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700" },
};

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];
export const methodLabel = (v) => PAYMENT_METHODS.find((m) => m.value === v)?.label || v || "—";

export const TAX_MODES = [
  { value: "gst_intra", label: "GST: CGST + SGST (same state)" },
  { value: "gst_inter", label: "GST: IGST (other state)" },
  { value: "none", label: "No tax" },
];

export const UNITS = ["", "nos", "hrs", "days", "month", "post", "reel", "video", "page", "project"];

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

/** Rounds like the server so previews match the saved totals. */
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const clamp = (v, lo, hi) => Math.min(Math.max(num(v), lo), hi);

/** Mirror of the server's totals engine, for live previews while editing. */
export const computeTotals = ({
  items = [],
  discountType = "none",
  discountValue = 0,
  taxMode = "gst_intra",
  tdsPercent = 0,
  adjustment = 0,
  roundTotal = true,
}) => {
  const lines = items
    .filter((i) => String(i.description || "").trim())
    .map((item) => {
      const gross = round2(num(item.quantity) * num(item.rate));
      const lineDiscount = round2((gross * clamp(item.discountPercent, 0, 100)) / 100);
      return { item, gross, lineDiscount, lineNet: round2(gross - lineDiscount) };
    });

  const counted = lines.filter((l) => !l.item.optional);
  const subtotal = round2(counted.reduce((s, l) => s + l.gross, 0));
  const lineDiscountTotal = round2(counted.reduce((s, l) => s + l.lineDiscount, 0));
  const after = round2(subtotal - lineDiscountTotal);

  let discount = 0;
  if (discountType === "percent") discount = round2((after * clamp(discountValue, 0, 100)) / 100);
  else if (discountType === "flat") discount = round2(Math.min(Math.max(num(discountValue), 0), after));
  const keep = after > 0 ? (after - discount) / after : 0;

  let taxable = 0;
  let tax = 0;
  let optionalTotal = 0;
  lines.forEach((l) => {
    const rate = taxMode === "none" ? 0 : Math.max(0, num(l.item.taxRate));
    if (l.item.optional) {
      optionalTotal += l.lineNet + (l.lineNet * rate) / 100;
    } else {
      const t = round2(l.lineNet * keep);
      taxable += t;
      tax += round2((t * rate) / 100);
    }
  });
  taxable = round2(taxable);
  tax = round2(tax);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (taxMode === "gst_intra") {
    cgst = round2(tax / 2);
    sgst = round2(tax - cgst);
  } else if (taxMode === "gst_inter") {
    igst = tax;
  }

  const adj = round2(num(adjustment));
  const before = round2(taxable + tax + adj);
  const total = roundTotal ? Math.round(before) : before;
  const tds = round2((taxable * clamp(tdsPercent, 0, 100)) / 100);
  return {
    subtotal,
    lineDiscount: lineDiscountTotal,
    discount,
    taxable,
    cgst,
    sgst,
    igst,
    tax,
    adjustment: adj,
    roundOff: round2(total - before),
    total,
    tds,
    payable: round2(Math.max(total - tds, 0)),
    optionalTotal: round2(optionalTotal),
  };
};

export const errorMessage = (error, fallback = "Something went wrong") =>
  (typeof error === "string" ? error : error?.message) || fallback;

export const downloadCsv = (filename, rows) => {
  const escape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** This month / last month / quarter / financial year / all ranges as yyyy-mm-dd pairs. */
export const rangePresets = (fyStartMonth = 4) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const fyYear = m + 1 >= fyStartMonth ? y : y - 1;
  const qStart = Math.floor(m / 3) * 3;
  return [
    { key: "month", label: "This month", from: toInputDate(new Date(y, m, 1)), to: toInputDate(now) },
    { key: "last", label: "Last month", from: toInputDate(new Date(y, m - 1, 1)), to: toInputDate(new Date(y, m, 0)) },
    { key: "quarter", label: "This quarter", from: toInputDate(new Date(y, qStart, 1)), to: toInputDate(now) },
    { key: "fy", label: "This financial year", from: toInputDate(new Date(fyYear, fyStartMonth - 1, 1)), to: toInputDate(now) },
    { key: "lastfy", label: "Last financial year", from: toInputDate(new Date(fyYear - 1, fyStartMonth - 1, 1)), to: toInputDate(new Date(fyYear, fyStartMonth - 1, 0)) },
  ];
};

export const blankItem = (taxRate = 18) => ({
  description: "",
  details: "",
  hsnSac: "",
  quantity: 1,
  unit: "",
  rate: "",
  discountPercent: 0,
  taxRate,
  optional: false,
});
