import React, { useMemo } from "react";
import { Field, inputCls, selectCls } from "../../accounts/components/ui";
import { usePermissions } from "../../../hooks/usePermissions";
import InstallmentsEditor from "./InstallmentsEditor";
import { PAYMENT_MODE_LABELS, fmtMoney, todayKey } from "../utils";

export const emptyEnrollment = () => ({
  course: "",
  batch: "",
  enrolledAt: todayKey(),
  fee: { total: "", discount: "" },
  admission: { on: false, amount: "", paid: false, mode: "cash", reference: "" },
  installments: [],
});

const admissionOf = (value) => (value.admission.on ? Math.max(0, Number(value.admission.amount) || 0) : 0);

/** Enough filled in to save: a course, and an amount if admission is ticked. */
export const enrollmentReady = (value) => Boolean(value.course) && (!value.admission.on || admissionOf(value) > 0);

/** Course, batch, fee, discount, admission fee and instalment plan for a new enrollment. */
const EnrollmentFields = ({ value, onChange, courses = [] }) => {
  const { hasPermission } = usePermissions();
  const canTakeFees = hasPermission("academy", "manageFees");
  const course = useMemo(() => courses.find((c) => c._id === value.course), [courses, value.course]);
  const batches = (course?.batches || []).filter((b) => b.status !== "completed" || b._id === value.batch);
  const total = value.fee.total === "" ? course?.fee || 0 : Number(value.fee.total) || 0;
  const courseFee = Math.max(0, total - (Number(value.fee.discount) || 0));
  const admission = admissionOf(value);

  const set = (patch) => onChange({ ...value, ...patch });
  const setAdmission = (patch) => set({ admission: { ...value.admission, ...patch } });

  const chooseCourse = (id) => {
    const c = courses.find((x) => x._id === id);
    set({
      course: id,
      batch: "",
      fee: { ...value.fee, total: c ? String(c.fee || 0) : "" },
      // the course's standard admission fee; staff can switch it off
      admission: { ...value.admission, on: c?.admissionFee > 0, amount: c?.admissionFee ? String(c.admissionFee) : "", paid: false },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Course" required>
          <select className={selectCls} value={value.course} onChange={(e) => chooseCourse(e.target.value)}>
            <option value="">Choose a course</option>
            {courses
              .filter((c) => c.isActive || c._id === value.course)
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Batch" hint={course && !batches.length ? "This course has no open batch yet" : undefined}>
          <select className={selectCls} value={value.batch} onChange={(e) => set({ batch: e.target.value })} disabled={!course}>
            <option value="">No batch yet</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
                {b.timing ? ` · ${b.timing}` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Enrolled on">
          <input type="date" className={inputCls} value={value.enrolledAt} onChange={(e) => set({ enrolledAt: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Course fee">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={value.fee.total}
              placeholder={course ? String(course.fee || 0) : ""}
              onChange={(e) => set({ fee: { ...value.fee, total: e.target.value } })}
            />
          </Field>
          <Field label="Discount">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={value.fee.discount}
              onChange={(e) => set({ fee: { ...value.fee, discount: e.target.value } })}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={value.admission.on}
            onChange={(e) => setAdmission({ on: e.target.checked, paid: false })}
            className="accent-[#3F8CFF]"
          />
          Admission fee
          {!value.admission.on && <span className="font-normal text-xs text-slate-400">Not charged for this student</span>}
        </label>
        {value.admission.on && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <Field label="Amount" required hint="Added on top of the course fee">
                <input type="number" min={0} className={inputCls} value={value.admission.amount} onChange={(e) => setAdmission({ amount: e.target.value })} />
              </Field>
              {canTakeFees && (
                <label className="flex items-center gap-2 text-sm text-slate-700 sm:pb-7">
                  <input
                    type="checkbox"
                    checked={value.admission.paid}
                    onChange={(e) => setAdmission({ paid: e.target.checked })}
                    className="accent-emerald-600"
                  />
                  <span className="font-semibold">Received now</span>
                </label>
              )}
            </div>
            {canTakeFees && value.admission.paid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Paid by">
                  <select className={selectCls} value={value.admission.mode} onChange={(e) => setAdmission({ mode: e.target.value })}>
                    {Object.entries(PAYMENT_MODE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reference" hint="UPI / receipt no. (optional)">
                  <input className={inputCls} value={value.admission.reference} onChange={(e) => setAdmission({ reference: e.target.value })} />
                </Field>
              </div>
            )}
          </>
        )}
      </div>

      {value.course && (
        <>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Instalment plan for the course fee ({fmtMoney(courseFee)})</p>
            <InstallmentsEditor value={value.installments} onChange={(installments) => set({ installments })} net={courseFee} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Course {fmtMoney(courseFee)}
              {admission > 0 && ` + admission ${fmtMoney(admission)}`}
              {admission > 0 && value.admission.paid && canTakeFees && (
                <span className="text-emerald-600 font-semibold"> · {fmtMoney(admission)} received now</span>
              )}
            </p>
            <p className="text-sm text-slate-600">
              Student pays <span className="font-bold text-slate-800">{fmtMoney(courseFee + admission)}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

/** Converts the form state into the API payload. */
export const enrollmentPayload = (value) => {
  const admission = admissionOf(value);
  return {
    course: value.course,
    batch: value.batch || null,
    enrolledAt: value.enrolledAt || undefined,
    fee: {
      total: value.fee.total === "" ? undefined : Number(value.fee.total),
      discount: Number(value.fee.discount) || 0,
      admission,
    },
    admissionPaid: admission > 0 && value.admission.paid ? { mode: value.admission.mode, reference: value.admission.reference } : undefined,
    installments: value.installments.map((i) => ({ label: i.label, dueDate: i.dueDate, amount: Number(i.amount) })),
  };
};

export default EnrollmentFields;
