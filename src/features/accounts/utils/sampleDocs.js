import { computeTotals } from "./format";

const items = [
  { description: "Social media management", details: "12 posts and 8 reels every month", hsnSac: "998361", quantity: 1, unit: "month", rate: 50000, discountPercent: 0, taxRate: 18 },
  { description: "Meta ads campaign setup", details: "", hsnSac: "998361", quantity: 2, unit: "nos", rate: 7500, discountPercent: 10, taxRate: 18 },
  { description: "Brand photo shoot", details: "Half day, 25 edited photos", hsnSac: "998391", quantity: 1, unit: "", rate: 20000, discountPercent: 0, taxRate: 18, optional: true },
].map((i) => ({ ...i, amount: i.quantity * i.rate }));

const totals = computeTotals({ items, taxMode: "gst_intra", discountType: "percent", discountValue: 5, tdsPercent: 10 });

const client = {
  name: "Acme Corporation Pvt Ltd",
  contactName: "Jane Doe",
  email: "accounts@acme.example",
  gstin: "32AAAAA0000A1Z5",
  address: { line1: "12 MG Road", city: "Kochi", state: "Kerala", pincode: "682011" },
};

const common = {
  client,
  currency: "INR",
  currencySymbol: "₹",
  issueDate: new Date().toISOString(),
  items,
  totals,
  taxMode: "gst_intra",
  discountType: "percent",
  discountValue: 5,
  tdsPercent: 10,
  placeOfSupply: "Kerala",
  notes: "Thank you for your business.",
  terms: "Payment is due within 15 days of the invoice date.",
};

const day = 86400000;

export const sampleInvoice = (bank) => ({
  ...common,
  number: "INV/2026-27/0001",
  title: "Social media retainer",
  status: "partially_paid",
  dueDate: new Date(Date.now() + 15 * day).toISOString(),
  periodStart: new Date().toISOString(),
  periodEnd: new Date(Date.now() + 29 * day).toISOString(),
  amountPaid: 10000,
  balance: totals.payable - 10000,
  payments: [{ _id: "p1", date: new Date().toISOString(), method: "upi", receiptNumber: "RCT/2026-27/0001", amount: 10000 }],
  bankAccount: bank || { accountHolder: "Your Business", accountNumber: "0123456789", ifsc: "HDFC0001234", bankName: "Your Bank", branch: "Main branch", upiId: "yourbusiness@bank" },
});

export const sampleProposal = () => ({
  ...common,
  number: "PRO/2026-27/0001",
  title: "Brand launch campaign",
  status: "sent",
  validUntil: new Date(Date.now() + 15 * day).toISOString(),
  version: 1,
  intro: "Thank you for the opportunity. Below is our plan and pricing for the launch.",
  sections: [{ _id: "s1", title: "Scope of work", body: "Strategy, creative production, paid media and weekly reporting." }],
  milestones: [
    { _id: "m1", title: "Advance", percent: 50, dueNote: "On approval" },
    { _id: "m2", title: "Delivery", percent: 50, dueNote: "On launch" },
  ],
  timeline: "Kick-off within 3 days of approval. First creatives in week 2.",
});
