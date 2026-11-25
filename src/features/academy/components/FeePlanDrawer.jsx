import React, { useEffect, useState } from "react";
import { Drawer, Field, inputCls, btnGhost, btnPrimary } from "../../accounts/components/ui";
import InstallmentsEditor from "./InstallmentsEditor";
import { useSetFees } from "../hooks/useAcademy";
import { dayKey, fmtMoney } from "../utils";

/** Change the fee, discount and instalment plan of an enrollment. */
const FeePlanDrawer = ({ enrollment, onClose }) => {
  const save = useSetFees();
  const [total, setTotal] = useState("");
  const [discount, setDiscount] = useState("");
  const [admission, setAdmission] = useState("");
  const [installments, setInstallments] = useState([]);

  useEffect(() => {
    if (!enrollment) return;
    setTotal(String(enrollment.fee?.total ?? 0));
    setDiscount(String(enrollment.fee?.discount ?? 0));
    setAdmission(String(enrollment.fee?.admission || ""));
    setInstallments(
      (enrollment.installments || []).map((i) => ({ label: i.label, dueDate: dayKey(i.dueDate), amount: i.amount }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?._id]);

  if (!enrollment) return null;
  const courseFee = Math.max(0, (Number(total) || 0) - (Number(discount) || 0));
  const net = courseFee + Math.max(0, Number(admission) || 0);
  const paid = enrollment.feeSummary?.paid || 0;

  const submit = () =>
    save.mutate(
      {
        id: enrollment._id,
        total: Number(total) || 0,
        discount: Number(discount) || 0,
        admission: Number(admission) || 0,
        installments: installments.map((i) => ({ label: i.label, dueDate: i.dueDate, amount: Number(i.amount) })),
      },
      { onSuccess: onClose }
    );

  return (
    <Drawer
      isOpen
      onClose={onClose}
      title="Fee plan"
      subtitle={`${enrollment.course?.name || ""} · ${fmtMoney(paid)} paid so far`}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button className={btnPrimary} onClick={submit} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save plan"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Course fee">
            <input type="number" min={0} className={inputCls} value={total} onChange={(e) => setTotal(e.target.value)} />
          </Field>
          <Field label="Discount">
            <input type="number" min={0} className={inputCls} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </Field>
          <Field label="Admission fee" hint="Empty = none">
            <input type="number" min={0} className={inputCls} value={admission} onChange={(e) => setAdmission(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Student pays">
            <div className="h-10 flex items-center font-bold text-slate-800">{fmtMoney(net)}</div>
          </Field>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Instalments for the course fee ({fmtMoney(courseFee)})</p>
          <InstallmentsEditor value={installments} onChange={setInstallments} net={courseFee} />
        </div>
        <p className="text-xs text-slate-400">Payments cover the admission fee first, then instalments in due-date order.</p>
      </div>
    </Drawer>
  );
};

export default FeePlanDrawer;
