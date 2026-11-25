import React, { useMemo } from "react";
import { Field, inputCls, selectCls } from "../../accounts/components/ui";
import InstallmentsEditor from "./InstallmentsEditor";
import { fmtMoney, todayKey } from "../utils";

export const emptyEnrollment = () => ({
  course: "",
  batch: "",
  enrolledAt: todayKey(),
  fee: { total: "", discount: "" },
  installments: [],
});

/** Course, batch, fee, discount and instalment plan for a new enrollment. */
const EnrollmentFields = ({ value, onChange, courses = [] }) => {
  const course = useMemo(() => courses.find((c) => c._id === value.course), [courses, value.course]);
  const batches = (course?.batches || []).filter((b) => b.status !== "completed" || b._id === value.batch);
  const total = value.fee.total === "" ? course?.fee || 0 : Number(value.fee.total) || 0;
  const net = Math.max(0, total - (Number(value.fee.discount) || 0));

  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Course" required>
          <select
            className={selectCls}
            value={value.course}
            onChange={(e) => {
              const c = courses.find((x) => x._id === e.target.value);
              set({ course: e.target.value, batch: "", fee: { ...value.fee, total: c ? String(c.fee || 0) : "" } });
            }}
          >
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

      {value.course && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">Instalment plan</p>
            <p className="text-xs text-slate-500">
              Net fee <span className="font-bold text-slate-800">{fmtMoney(net)}</span>
            </p>
          </div>
          <InstallmentsEditor value={value.installments} onChange={(installments) => set({ installments })} net={net} />
        </div>
      )}
    </div>
  );
};

/** Converts the form state into the API payload. */
export const enrollmentPayload = (value) => ({
  course: value.course,
  batch: value.batch || null,
  enrolledAt: value.enrolledAt || undefined,
  fee: { total: value.fee.total === "" ? undefined : Number(value.fee.total), discount: Number(value.fee.discount) || 0 },
  installments: value.installments.map((i) => ({ label: i.label, dueDate: i.dueDate, amount: Number(i.amount) })),
});

export default EnrollmentFields;
