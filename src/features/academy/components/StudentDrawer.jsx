import React, { useEffect, useState } from "react";
import { Drawer, Field, inputCls, selectCls, btnPrimary, btnGhost } from "../../accounts/components/ui";
import EnrollmentFields, { emptyEnrollment, enrollmentPayload, enrollmentReady } from "./EnrollmentFields";
import { useCourses, useCreateStudent, useUpdateStudent } from "../hooks/useAcademy";
import { SOURCE_LABELS, dayKey } from "../utils";

const emptyStudent = () => ({
  name: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
  qualification: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  source: "meta_ads",
  notes: "",
});

/**
 * Add a student (optionally with a first enrollment), or edit one.
 * onCreated receives the API response so the caller can show the login.
 */
const StudentDrawer = ({ isOpen, onClose, student, onCreated }) => {
  const isEdit = Boolean(student?._id);
  const [form, setForm] = useState(emptyStudent);
  const [enroll, setEnroll] = useState(true);
  const [enrollment, setEnrollment] = useState(emptyEnrollment);
  const { data: courseData } = useCourses({ active: "true" });
  const create = useCreateStudent();
  const update = useUpdateStudent();
  const busy = create.isPending || update.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      student
        ? { ...emptyStudent(), ...Object.fromEntries(Object.keys(emptyStudent()).map((k) => [k, student[k] ?? ""])), dob: dayKey(student.dob) }
        : emptyStudent()
    );
    setEnroll(true);
    setEnrollment(emptyEnrollment());
  }, [isOpen, student]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSave = form.name.trim() && (form.phone.trim() || form.email.trim()) && (isEdit || !enroll || enrollmentReady(enrollment));

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    const body = { ...form, dob: form.dob || null };
    if (isEdit) {
      update.mutate({ id: student._id, ...body }, { onSuccess: onClose });
    } else {
      create.mutate(
        { ...body, enrollment: enroll ? enrollmentPayload(enrollment) : undefined },
        {
          onSuccess: (data) => {
            onClose();
            onCreated?.(data);
          },
        }
      );
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit student" : "Add student"}
      subtitle={isEdit ? student.studentId : "A student ID and portal password are created automatically"}
      width="max-w-2xl"
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} disabled={!canSave || busy} onClick={submit}>
            {busy ? "Saving…" : isEdit ? "Save" : "Add student"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name" required className="sm:col-span-2">
            <input className={inputCls} value={form.name} onChange={set("name")} autoFocus />
          </Field>
          <Field label="Phone" hint="Used to log in to the portal">
            <input className={inputCls} value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="98765 43210" />
          </Field>
          <Field label="Email" hint="Can also be used to log in">
            <input className={inputCls} type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Came from">
            <select className={selectCls} value={form.source} onChange={set("source")}>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qualification">
            <input className={inputCls} value={form.qualification} onChange={set("qualification")} placeholder="e.g. B.Com" />
          </Field>
          <Field label="Date of birth">
            <input type="date" className={inputCls} value={form.dob} onChange={set("dob")} />
          </Field>
          <Field label="Gender">
            <select className={selectCls} value={form.gender} onChange={set("gender")}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Guardian name">
            <input className={inputCls} value={form.guardianName} onChange={set("guardianName")} />
          </Field>
          <Field label="Guardian phone">
            <input className={inputCls} value={form.guardianPhone} onChange={set("guardianPhone")} inputMode="tel" />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <textarea className={inputCls} rows={2} value={form.address} onChange={set("address")} />
          </Field>
          <Field label="Staff notes" hint="Not shown to the student" className="sm:col-span-2">
            <textarea className={inputCls} rows={2} value={form.notes} onChange={set("notes")} />
          </Field>
        </section>

        {!isEdit && (
          <section className="border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={enroll} onChange={(e) => setEnroll(e.target.checked)} className="accent-[#3F8CFF]" />
              Enroll in a course now
            </label>
            {enroll && <EnrollmentFields value={enrollment} onChange={setEnrollment} courses={courseData?.courses || []} />}
          </section>
        )}
      </form>
    </Drawer>
  );
};

export default StudentDrawer;
