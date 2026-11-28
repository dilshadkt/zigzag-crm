import React, { useState } from "react";
import { Drawer, ErrorState, Field, Spinner, btnGhost, btnPrimary, inputCls, selectCls } from "../../accounts/components/ui";
import InstallmentsEditor from "./InstallmentsEditor";
import { useChangeCourse, useCourses, useStudent } from "../hooks/useAcademy";
import { useAcademy } from "../context";
import { dayKey, fmtMoney } from "../utils";

const courseFeeOf = (fee) => Math.max(0, (Number(fee.total) || 0) - (Number(fee.discount) || 0));

const ChangeCourseForm = ({ enrollment, studentName, courses, onClose }) => {
  const { permissions } = useAcademy();
  const save = useChangeCourse();
  const [courseId, setCourseId] = useState("");
  const [batch, setBatch] = useState("");
  const [fee, setFee] = useState({ total: "", discount: "", admission: "" });
  const [installments, setInstallments] = useState([]);

  const course = courses.find((c) => c._id === courseId);
  const batches = (course?.batches || []).filter((b) => b.status !== "completed");
  const oldPlan = enrollment.installments || [];
  const paid = enrollment.feeSummary?.paid || 0;
  const courseFee = courseFeeOf(fee);
  const net = courseFee + Math.max(0, Number(fee.admission) || 0);
  const planned = installments.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const planOff = installments.length > 0 && Math.abs(courseFee - planned) > 0.5;
  const badDiscount = Number(fee.discount) < 0 || Number(fee.discount) > (Number(fee.total) || 0);
  const overpaid = paid - net > 0.005;
  const certified = Boolean(enrollment.certificate);
  // Without the fees permission the fee is left exactly as it is
  const editFee = permissions.manageFees;
  const canSave = Boolean(course) && !certified && (!editFee || (!planOff && !badDiscount && !overpaid));

  const chooseCourse = (id) => {
    const next = courses.find((c) => c._id === id);
    setCourseId(id);
    setBatch("");
    if (!next) return;
    // the new course's fee, with this student's discount and admission fee carried over
    const total = next.fee || 0;
    const nextFee = {
      total: String(total),
      discount: String(Math.min(enrollment.fee?.discount || 0, total)),
      admission: String(enrollment.fee?.admission || ""),
    };
    setFee(nextFee);
    // the old plan still fits only when the course fee comes to the same amount
    const fits = Math.abs(courseFeeOf(nextFee) - courseFeeOf(enrollment.fee || {})) <= 0.5;
    setInstallments(fits ? oldPlan.map((i) => ({ label: i.label, dueDate: dayKey(i.dueDate), amount: i.amount })) : []);
  };

  const set = (k) => (e) => setFee((f) => ({ ...f, [k]: e.target.value }));

  const submit = () =>
    save.mutate(
      {
        id: enrollment._id,
        course: courseId,
        batch: batch || null,
        ...(editFee
          ? {
              fee: { total: Number(fee.total) || 0, discount: Number(fee.discount) || 0, admission: Number(fee.admission) || 0 },
              installments: installments.map((i) => ({ label: i.label, dueDate: i.dueDate, amount: Number(i.amount) })),
            }
          : {}),
      },
      { onSuccess: onClose }
    );

  return (
    <Drawer
      isOpen
      onClose={onClose}
      title="Change course"
      subtitle={`${studentName} · now on ${enrollment.course?.name || "a deleted course"}`}
      width="max-w-2xl"
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button className={btnPrimary} onClick={submit} disabled={!canSave || save.isPending}>
            {save.isPending ? "Saving…" : "Change course"}
          </button>
        </>
      }
    >
      {certified ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Certificate {enrollment.certificate.number} was issued for this course. Remove the certificate first, then change the course.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="New course" required>
              <select className={selectCls} value={courseId} onChange={(e) => chooseCourse(e.target.value)}>
                <option value="">Choose a course</option>
                {courses
                  .filter((c) => c.isActive && c._id !== enrollment.course?._id)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Batch" hint={course && !batches.length ? "This course has no open batch yet" : undefined}>
              <select className={selectCls} value={batch} onChange={(e) => setBatch(e.target.value)} disabled={!course}>
                <option value="">No batch yet</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                    {b.timing ? ` · ${b.timing}` : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {course && (
            <>
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Payments already recorded ({fmtMoney(paid)}) stay with the student.
                {enrollment.batch && ` Attendance and tasks from ${enrollment.batch.name} will no longer count towards this course.`}
              </p>

              {editFee ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Course fee" hint={`Was ${fmtMoney(enrollment.fee?.total)}`}>
                      <input type="number" min={0} className={inputCls} value={fee.total} onChange={set("total")} />
                    </Field>
                    <Field label="Discount" error={badDiscount ? "More than the fee" : undefined}>
                      <input type="number" min={0} className={inputCls} value={fee.discount} onChange={set("discount")} />
                    </Field>
                    <Field label="Admission fee" hint="Empty = none">
                      <input type="number" min={0} className={inputCls} value={fee.admission} onChange={set("admission")} placeholder="0" />
                    </Field>
                    <Field label="Student pays">
                      <div className="h-10 flex items-center font-bold text-slate-800">{fmtMoney(net)}</div>
                    </Field>
                  </div>
                  {overpaid && (
                    <p className="text-xs font-semibold text-red-600">
                      The student has already paid {fmtMoney(paid)}, which is more than {fmtMoney(net)}. Raise the fee, or remove a payment first.
                    </p>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Instalments for the course fee ({fmtMoney(courseFee)})</p>
                    {oldPlan.length > 0 && !installments.length && (
                      <p className="text-xs text-amber-700 mb-2">The old instalment plan is not carried over. Make a new one, or leave it empty.</p>
                    )}
                    <InstallmentsEditor key={courseId} value={installments} onChange={setInstallments} net={courseFee} />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">
                  The fee stays at {fmtMoney(enrollment.fee?.net)}. Someone with the Manage Fees permission can change it from the fee plan.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </Drawer>
  );
};

/** Move one of a student's enrollments to another course. Mount it only while open. */
const ChangeCourseDrawer = ({ studentId, enrollmentId, onClose }) => {
  const student = useStudent(studentId);
  const courses = useCourses();
  const enrollment = student.data?.enrollments.find((e) => e._id === enrollmentId);

  if (!enrollment || !courses.data) {
    const failed = student.isError || courses.isError;
    return (
      <Drawer isOpen onClose={onClose} title="Change course" width="max-w-2xl">
        {failed ? (
          <ErrorState
            error={student.error || courses.error}
            onRetry={() => {
              student.refetch();
              courses.refetch();
            }}
          />
        ) : student.data && courses.data ? (
          <p className="text-sm text-slate-500 text-center py-8">This enrollment no longer exists.</p>
        ) : (
          <Spinner />
        )}
      </Drawer>
    );
  }

  return <ChangeCourseForm enrollment={enrollment} studentName={student.data.student.name} courses={courses.data.courses} onClose={onClose} />;
};

export default ChangeCourseDrawer;
