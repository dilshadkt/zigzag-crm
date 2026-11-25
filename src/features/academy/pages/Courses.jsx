import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiEdit2, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import {
  Card,
  ConfirmModal,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Spinner,
  StatusBadge,
  Table,
  btnGhost,
  btnPrimary,
  btnSmall,
  inputCls,
  selectCls,
} from "../../accounts/components/ui";
import {
  useBatch,
  useCourses,
  useCreateBatch,
  useCreateCourse,
  useDeleteBatch,
  useDeleteCourse,
  useTrainers,
  useUpdateBatch,
  useUpdateCourse,
} from "../hooks/useAcademy";
import { useAcademy } from "../context";
import { BATCH_STATUS, CLASS_DAYS, ENROLLMENT_STATUS, MODE_LABELS, dayKey, fmtDay, fmtMoney } from "../utils";

// ---------- course drawer ----------
const emptyCourse = () => ({ name: "", code: "", mode: "offline", durationWeeks: "", fee: "", description: "", isActive: true, syllabus: [] });

const CourseDrawer = ({ course, isOpen, onClose }) => {
  const [form, setForm] = useState(emptyCourse);
  const create = useCreateCourse();
  const update = useUpdateCourse();
  const busy = create.isPending || update.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      course
        ? {
            ...emptyCourse(),
            ...course,
            durationWeeks: course.durationWeeks ?? "",
            fee: course.fee ?? "",
            syllabus: (course.syllabus || []).map((m) => ({ title: m.title, topics: (m.topics || []).join("\n") })),
          }
        : emptyCourse()
    );
  }, [isOpen, course]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setModule = (idx, patch) => setForm((f) => ({ ...f, syllabus: f.syllabus.map((m, i) => (i === idx ? { ...m, ...patch } : m)) }));

  const submit = () => {
    const body = {
      name: form.name,
      code: form.code,
      mode: form.mode,
      durationWeeks: Number(form.durationWeeks) || 0,
      fee: Number(form.fee) || 0,
      description: form.description,
      isActive: form.isActive,
      syllabus: form.syllabus.map((m) => ({ title: m.title, topics: m.topics.split("\n") })),
    };
    if (course?._id) update.mutate({ id: course._id, ...body }, { onSuccess: onClose });
    else create.mutate(body, { onSuccess: onClose });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={course?._id ? "Edit course" : "New course"}
      width="max-w-2xl"
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button className={btnPrimary} onClick={submit} disabled={!form.name.trim() || busy}>
            {busy ? "Saving…" : "Save course"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Course name" required className="sm:col-span-2">
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Diploma in Digital Marketing" autoFocus />
          </Field>
          <Field label="Code">
            <input className={inputCls} value={form.code} onChange={set("code")} placeholder="DDM" />
          </Field>
          <Field label="Mode">
            <select className={selectCls} value={form.mode} onChange={set("mode")}>
              {Object.entries(MODE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duration (weeks)">
            <input type="number" min={0} className={inputCls} value={form.durationWeeks} onChange={set("durationWeeks")} />
          </Field>
          <Field label="Standard fee" hint="Pre-filled when a student enrolls; can be changed per student">
            <input type="number" min={0} className={inputCls} value={form.fee} onChange={set("fee")} />
          </Field>
          <Field label="Description" hint="Shown to students on their portal" className="sm:col-span-2">
            <textarea className={inputCls} rows={3} value={form.description} onChange={set("description")} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="accent-[#3F8CFF]" />
            Open for enrollment
          </label>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-700">Syllabus</p>
            <button className={btnSmall} onClick={() => setForm((f) => ({ ...f, syllabus: [...f.syllabus, { title: "", topics: "" }] }))}>
              <FiPlus /> Module
            </button>
          </div>
          {form.syllabus.length === 0 && <p className="text-xs text-slate-400">Add modules so students can see what they will learn.</p>}
          <div className="space-y-3">
            {form.syllabus.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 p-3 space-y-2">
                <div className="flex gap-2">
                  <span className="w-7 h-10 flex items-center justify-center text-xs font-bold text-slate-400">{idx + 1}</span>
                  <input className={inputCls} placeholder="Module title, e.g. Meta Ads" value={m.title} onChange={(e) => setModule(idx, { title: e.target.value })} />
                  <button
                    className="w-10 h-10 shrink-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                    onClick={() => setForm((f) => ({ ...f, syllabus: f.syllabus.filter((_, i) => i !== idx) }))}
                    aria-label="Remove module"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <textarea
                  className={`${inputCls} ml-9 !w-[calc(100%-2.25rem)]`}
                  rows={3}
                  placeholder={"One topic per line\nCampaign structure\nAudiences"}
                  value={m.topics}
                  onChange={(e) => setModule(idx, { topics: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

// ---------- batch drawer ----------
const emptyBatch = () => ({ name: "", timing: "", classDays: ["mon", "tue", "wed", "thu", "fri", "sat"], startDate: "", endDate: "", trainer: "", capacity: "", status: "upcoming" });

const BatchDrawer = ({ batch, course, onClose }) => {
  const isOpen = Boolean(course);
  const [form, setForm] = useState(emptyBatch);
  const { data: trainerData } = useTrainers();
  const create = useCreateBatch();
  const update = useUpdateBatch();
  const busy = create.isPending || update.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      batch
        ? {
            ...emptyBatch(),
            ...batch,
            startDate: dayKey(batch.startDate),
            endDate: dayKey(batch.endDate),
            trainer: batch.trainer?._id || batch.trainer || "",
            capacity: batch.capacity || "",
          }
        : emptyBatch()
    );
  }, [isOpen, batch]);

  if (!isOpen) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleDay = (d) =>
    setForm((f) => ({ ...f, classDays: f.classDays.includes(d) ? f.classDays.filter((x) => x !== d) : [...f.classDays, d] }));

  const submit = () => {
    const body = {
      name: form.name,
      timing: form.timing,
      classDays: form.classDays,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      trainer: form.trainer || null,
      capacity: Number(form.capacity) || 0,
      status: form.status,
    };
    if (batch?._id) update.mutate({ id: batch._id, ...body }, { onSuccess: onClose });
    else create.mutate({ ...body, course: course._id }, { onSuccess: onClose });
  };

  return (
    <Drawer
      isOpen
      onClose={onClose}
      title={batch?._id ? "Edit batch" : "New batch"}
      subtitle={course.name}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button className={btnPrimary} onClick={submit} disabled={!form.name.trim() || busy}>
            {busy ? "Saving…" : "Save batch"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Batch name" required>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Morning Batch – Dec 2026" autoFocus />
        </Field>
        <Field label="Timing">
          <input className={inputCls} value={form.timing} onChange={set("timing")} placeholder="9:30 AM – 12:30 PM" />
        </Field>
        <Field label="Class days" className="sm:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {CLASS_DAYS.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleDay(k)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold border ${
                  form.classDays.includes(k) ? "bg-[#ECF3FF] text-[#3F8CFF] border-[#3F8CFF]/30" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Starts">
          <input type="date" className={inputCls} value={form.startDate} onChange={set("startDate")} />
        </Field>
        <Field label="Ends">
          <input type="date" className={inputCls} value={form.endDate} onChange={set("endDate")} min={form.startDate || undefined} />
        </Field>
        <Field label="Trainer">
          <select className={selectCls} value={form.trainer} onChange={set("trainer")}>
            <option value="">Not assigned</option>
            {(trainerData?.trainers || []).map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
                {t.position ? ` · ${t.position}` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Seats" hint="0 = no limit">
          <input type="number" min={0} className={inputCls} value={form.capacity} onChange={set("capacity")} />
        </Field>
        <Field label="Status">
          <select className={selectCls} value={form.status} onChange={set("status")}>
            {Object.entries(BATCH_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Drawer>
  );
};

// ---------- roster drawer ----------
const RosterDrawer = ({ batchId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useBatch(batchId);
  if (!batchId) return null;
  return (
    <Drawer isOpen onClose={onClose} title={data?.batch?.name || "Batch"} subtitle={data?.batch?.course?.name}>
      {isLoading ? (
        <Spinner />
      ) : (
        <Table
          rows={data?.roster || []}
          onRowClick={(r) => r.student && navigate(`/academy/students/${r.student._id}`)}
          empty={<p className="text-sm text-slate-400 text-center py-8">No students in this batch yet.</p>}
          columns={[
            {
              key: "student",
              title: "Student",
              render: (r) => (
                <div>
                  <p className="font-semibold text-slate-700">{r.student?.name}</p>
                  <p className="text-xs text-slate-400">
                    {r.student?.studentId} · {r.student?.phone}
                  </p>
                </div>
              ),
            },
            { key: "status", title: "Status", align: "right", render: (r) => <StatusBadge status={r.status} map={ENROLLMENT_STATUS} /> },
          ]}
        />
      )}
    </Drawer>
  );
};

// ---------- page ----------
const Courses = () => {
  const { permissions: p } = useAcademy();
  const { data, isLoading, isError, error, refetch } = useCourses();
  const delCourse = useDeleteCourse();
  const delBatch = useDeleteBatch();
  const [courseDrawer, setCourseDrawer] = useState(null); // {} for new, course to edit
  const [batchDrawer, setBatchDrawer] = useState(null); // {course, batch?}
  const [roster, setRoster] = useState(null);
  const [confirm, setConfirm] = useState(null);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const courses = data?.courses || [];

  return (
    <div>
      <PageHeader
        title="Courses & batches"
        subtitle="What you teach, and the groups of students learning it together"
        actions={
          p.manageCourses && (
            <button className={btnPrimary} onClick={() => setCourseDrawer({})}>
              <FiPlus /> New course
            </button>
          )
        }
      />

      {courses.length === 0 && (
        <Card>
          <EmptyState
            icon={FiBookOpen}
            title="No courses yet"
            text="Create your courses first, for example Offline, Online and Weekend digital marketing, then add batches to each."
            action={
              p.manageCourses && (
                <button className={btnPrimary} onClick={() => setCourseDrawer({})}>
                  <FiPlus /> New course
                </button>
              )
            }
          />
        </Card>
      )}

      <div className="space-y-4">
        {courses.map((c) => (
          <Card
            key={c._id}
            padded={false}
            title={
              <span className="flex items-center gap-2 flex-wrap">
                {c.name}
                {c.code && <span className="text-xs font-semibold text-slate-400">{c.code}</span>}
                {!c.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">Closed</span>}
              </span>
            }
            subtitle={[MODE_LABELS[c.mode], c.durationWeeks ? `${c.durationWeeks} weeks` : null, c.fee ? fmtMoney(c.fee) : null, c.syllabus?.length ? `${c.syllabus.length} modules` : null]
              .filter(Boolean)
              .join(" · ")}
            actions={
              p.manageCourses && (
                <div className="flex gap-1.5">
                  <button className={btnSmall} onClick={() => setBatchDrawer({ course: c })}>
                    <FiPlus /> Batch
                  </button>
                  <button className={btnSmall} onClick={() => setCourseDrawer(c)} aria-label="Edit course">
                    <FiEdit2 />
                  </button>
                  <button className={btnSmall} onClick={() => setConfirm({ type: "course", item: c })} aria-label="Delete course">
                    <FiTrash2 />
                  </button>
                </div>
              )
            }
          >
            <div className="pt-2">
              <Table
                dense
                rows={c.batches}
                onRowClick={(b) => setRoster(b._id)}
                empty={<p className="text-xs text-slate-400 px-4 py-4">No batches yet.</p>}
                columns={[
                  {
                    key: "name",
                    title: "Batch",
                    render: (b) => (
                      <div>
                        <p className="font-semibold text-slate-700">{b.name}</p>
                        <p className="text-xs text-slate-400">{[b.timing, b.classDays?.length ? b.classDays.join(", ") : null].filter(Boolean).join(" · ")}</p>
                      </div>
                    ),
                  },
                  { key: "dates", title: "Dates", className: "hidden md:table-cell", render: (b) => <span className="text-xs text-slate-500">{b.startDate ? `${fmtDay(b.startDate)} – ${fmtDay(b.endDate)}` : "—"}</span> },
                  { key: "trainer", title: "Trainer", className: "hidden md:table-cell", render: (b) => <span className="text-xs text-slate-600">{b.trainerName || "—"}</span> },
                  {
                    key: "students",
                    title: "Students",
                    render: (b) => (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <FiUsers className="text-slate-400" /> {b.activeStudents}
                        {b.capacity ? ` / ${b.capacity}` : ""}
                      </span>
                    ),
                  },
                  { key: "status", title: "Status", render: (b) => <StatusBadge status={b.status} map={BATCH_STATUS} /> },
                  {
                    key: "actions",
                    title: "",
                    align: "right",
                    render: (b) =>
                      p.manageCourses && (
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className={btnSmall} onClick={() => setBatchDrawer({ course: c, batch: b })} aria-label="Edit batch">
                            <FiEdit2 />
                          </button>
                          <button className={btnSmall} onClick={() => setConfirm({ type: "batch", item: b })} aria-label="Delete batch">
                            <FiTrash2 />
                          </button>
                        </div>
                      ),
                  },
                ]}
              />
            </div>
          </Card>
        ))}
      </div>

      <CourseDrawer isOpen={Boolean(courseDrawer)} course={courseDrawer?._id ? courseDrawer : null} onClose={() => setCourseDrawer(null)} />
      <BatchDrawer course={batchDrawer?.course} batch={batchDrawer?.batch} onClose={() => setBatchDrawer(null)} />
      <RosterDrawer batchId={roster} onClose={() => setRoster(null)} />
      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        title={confirm?.type === "course" ? "Delete course?" : "Delete batch?"}
        message={
          confirm?.type === "course"
            ? `${confirm?.item?.name} can only be deleted while it has no batches or students. Otherwise close it for enrollment instead.`
            : `${confirm?.item?.name} can only be deleted while it has no students or tasks. Otherwise mark it completed.`
        }
        confirmLabel="Delete"
        busy={delCourse.isPending || delBatch.isPending}
        onConfirm={() => {
          const done = { onSettled: () => setConfirm(null) };
          if (confirm.type === "course") delCourse.mutate(confirm.item._id, done);
          else delBatch.mutate(confirm.item._id, done);
        }}
      />
    </div>
  );
};

export default Courses;
