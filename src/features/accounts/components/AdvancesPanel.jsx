import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiDollarSign, FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { useAccountsContext } from "../context";
import { useAdvances, useCreateAdvance, useDeleteAdvance, useUpdateAdvance } from "../hooks/useAccounts";
import { currentMonthKey, errorMessage, fmtDate, fmtMoney, monthLabel, toInputDate } from "../utils/format";
import { EmptyState, ErrorState, Field, Spinner, Table, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "./ui";

const blank = () => ({ employee: "", amount: "", date: toInputDate(new Date()), recoverMonth: currentMonthKey(), note: "" });

const AdvanceModal = ({ advance, employees, onClose }) => {
  const create = useCreateAdvance();
  const update = useUpdateAdvance();
  const [form, setForm] = useState(() =>
    advance?._id
      ? { employee: advance.employee?._id || advance.employee, amount: advance.amount, date: toInputDate(advance.date), recoverMonth: advance.recoverMonth, note: advance.note || "" }
      : blank()
  );
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const saving = create.isPending || update.isPending;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.employee) return toast.error("Choose an employee");
    if (!(Number(form.amount) > 0)) return toast.error("Enter the advance amount");
    try {
      if (advance?._id) await update.mutateAsync({ id: advance._id, data: form });
      else await create.mutateAsync(form);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={advance?._id ? "Edit advance" : "Record an advance"}>
      <form onSubmit={submit} className="pt-4 space-y-3">
        <Field label="Employee" required>
          <select className={selectCls} value={form.employee} onChange={(e) => set({ employee: e.target.value })} disabled={!!advance?._id}>
            <option value="">Select employee</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" required><input type="number" min="0" step="any" className={inputCls} value={form.amount} onChange={(e) => set({ amount: e.target.value })} /></Field>
          <Field label="Given on"><input type="date" className={inputCls} value={form.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        </div>
        <Field label="Recover from the salary of" hint="Deducted from this month's payslip. An advance not recovered by then is picked up by the next payroll.">
          <input type="month" className={inputCls} value={form.recoverMonth} onChange={(e) => set({ recoverMonth: e.target.value })} />
        </Field>
        <Field label="Note"><input className={inputCls} value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Medical emergency" /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
};

const AdvancesPanel = ({ employees }) => {
  const { symbol } = useAccountsContext();
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null); // null: closed, {}: new
  const q = useAdvances(status ? { status } : undefined);
  const remove = useDeleteAdvance();

  const onDelete = async (advance) => {
    if (!window.confirm(`Delete the ${fmtMoney(advance.amount, symbol)} advance?`)) return;
    try {
      await remove.mutateAsync(advance._id);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const advances = q.data?.advances || [];
  const pending = advances.filter((a) => a.status === "pending").reduce((s, a) => s + a.amount, 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select className={`${selectCls} !w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All advances</option>
            <option value="pending">Waiting to be recovered</option>
            <option value="recovered">Recovered</option>
          </select>
          {pending > 0 && <span className="text-xs text-slate-500">{fmtMoney(pending, symbol)} waiting to be recovered</span>}
        </div>
        <button className={btnPrimary} onClick={() => setEditing({})}><FiPlus /> Record advance</button>
      </div>
      {q.isLoading ? (
        <Spinner />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={q.refetch} />
      ) : (
        <Table
          rows={advances}
          empty={<EmptyState icon={FiDollarSign} title="No advances" text="Advances you record are deducted from the employee's payslip for the month you choose." />}
          columns={[
            { key: "emp", title: "Employee", render: (a) => <span className="font-semibold text-slate-800">{a.employee?.firstName} {a.employee?.lastName}</span> },
            { key: "date", title: "Given on", render: (a) => <span className="text-slate-500">{fmtDate(a.date)}</span> },
            { key: "amt", title: "Amount", align: "right", render: (a) => <span className="font-semibold tabular-nums">{fmtMoney(a.amount, symbol)}</span> },
            { key: "month", title: "Recover in", render: (a) => monthLabel(a.recoverMonth, true) },
            { key: "note", title: "Note", render: (a) => <span className="text-xs text-slate-500">{a.note || "—"}</span> },
            { key: "status", title: "Status", render: (a) => <span className={`text-xs font-semibold ${a.status === "recovered" ? "text-emerald-600" : "text-amber-600"}`}>{a.status === "recovered" ? "Recovered" : "Waiting"}</span> },
            { key: "act", title: "", align: "right", render: (a) => a.status === "pending" && (
              <div className="flex justify-end gap-1">
                <button className={btnSmall} onClick={() => setEditing(a)}>Edit</button>
                <button className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => onDelete(a)} aria-label="Delete"><FiTrash2 /></button>
              </div>
            ) },
          ]}
        />
      )}
      {editing && <AdvanceModal advance={editing} employees={employees} onClose={() => setEditing(null)} />}
    </div>
  );
};

export default AdvancesPanel;
