import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useCreateVendor, useUpdateVendor } from "../hooks/useAccounts";
import { errorMessage } from "../utils/format";
import { Drawer, Field, btnGhost, btnPrimary, inputCls } from "./ui";

const blank = (name = "") => ({ name, phone: "", email: "", gstin: "", address: "", notes: "" });

/** Add or edit a vendor. `onSaved(vendor)` lets the caller select the new vendor. */
const VendorDrawer = ({ isOpen, onClose, vendor, initialName = "", onSaved, width = "max-w-md" }) => {
  const create = useCreateVendor();
  const update = useUpdateVendor();
  const [form, setForm] = useState(blank());

  useEffect(() => {
    if (!isOpen) return;
    setForm(vendor ? { ...blank(), ...vendor } : blank(initialName));
  }, [isOpen, vendor, initialName]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const busy = create.isPending || update.isPending;

  const submit = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (!form.name.trim()) {
      toast.error("Enter the vendor name");
      return;
    }
    const data = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      gstin: form.gstin,
      address: form.address,
      notes: form.notes,
    };
    try {
      const res = vendor
        ? await update.mutateAsync({ id: vendor._id, data })
        : await create.mutateAsync(data);
      onSaved?.(res.vendor);
      onClose();
    } catch {
      // the mutation hook already showed the error
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width={width}
      title={vendor ? "Edit vendor" : "Add vendor"}
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Save vendor"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Vendor name" required>
          <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
        </div>
        <Field label="GSTIN" hint="Optional, handy for claiming input credit">
          <input className={inputCls} value={form.gstin} onChange={(e) => set({ gstin: e.target.value })} />
        </Field>
        <Field label="Address"><textarea className={inputCls} rows={2} value={form.address} onChange={(e) => set({ address: e.target.value })} /></Field>
        <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  );
};

export default VendorDrawer;
