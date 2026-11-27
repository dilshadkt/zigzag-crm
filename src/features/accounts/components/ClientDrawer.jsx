import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useCreateAccountClient, useUpdateAccountClient } from "../hooks/useAccounts";
import { INDIAN_STATES } from "../utils/format";
import { Drawer, Field, btnGhost, btnPrimary, inputCls, selectCls } from "./ui";

const blank = () => ({
  name: "", contactName: "", phone: "", email: "", gstin: "", pan: "", notes: "",
  address: { line1: "", city: "", state: "", pincode: "" },
});

/** Add or edit a client who has no project: someone we only quote and bill. */
const ClientDrawer = ({ isOpen, onClose, client }) => {
  const create = useCreateAccountClient();
  const update = useUpdateAccountClient();
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!isOpen) return;
    setForm(client ? { ...blank(), ...client, address: { ...blank().address, ...client.address } } : blank());
  }, [isOpen, client]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAddress = (patch) => setForm((f) => ({ ...f, address: { ...f.address, ...patch } }));
  const busy = create.isPending || update.isPending;

  const submit = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (!form.name.trim()) {
      toast.error("Enter the client name");
      return;
    }
    const data = {
      name: form.name,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email,
      gstin: form.gstin,
      pan: form.pan,
      address: form.address,
      notes: form.notes,
    };
    try {
      if (client) await update.mutateAsync({ id: client._id, data });
      else await create.mutateAsync(data);
      onClose();
    } catch {
      // the mutation hook already showed the error
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-md"
      title={client ? "Edit client" : "Add client"}
      subtitle="No project is created. Convert them from Add Project when work starts."
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Save client"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Client name" required>
          <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </Field>
        <Field label="Contact person">
          <input className={inputCls} value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
          <Field label="GSTIN"><input className={inputCls} value={form.gstin} onChange={(e) => set({ gstin: e.target.value.toUpperCase() })} /></Field>
          <Field label="PAN"><input className={inputCls} value={form.pan} onChange={(e) => set({ pan: e.target.value.toUpperCase() })} /></Field>
        </div>
        <Field label="Address">
          <input className={inputCls} value={form.address.line1} onChange={(e) => setAddress({ line1: e.target.value })} placeholder="Street, area" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City"><input className={inputCls} value={form.address.city} onChange={(e) => setAddress({ city: e.target.value })} /></Field>
          <Field label="PIN code"><input className={inputCls} value={form.address.pincode} onChange={(e) => setAddress({ pincode: e.target.value })} /></Field>
        </div>
        <Field label="State" hint="Decides CGST + SGST or IGST on invoices">
          <select className={selectCls} value={form.address.state} onChange={(e) => setAddress({ state: e.target.value })}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Internal notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  );
};

export default ClientDrawer;
