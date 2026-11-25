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
import SyllabusDrawer from "../components/SyllabusDrawer";
import BatchSyllabusDrawer from "../components/BatchSyllabusDrawer";
import { BATCH_STATUS, CLASS_DAYS, ENROLLMENT_STATUS, MODE_LABELS, dayKey, fmtDay, fmtMoney } from "../utils";

// ---------- course drawer ----------
const emptyCourse = () => ({ name: "", code: "", mode: "offline", durationWeeks: "", fee: "", admissionFee: "", description: "", isActive: true });

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
            admissionFee: course.admissionFee || "",
          }
        : emptyCourse()
    );
  }, [isOpen, course]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = () => {
    const body = {
      name: form.name,
      code: form.code,
      mode: form.mode,
      durationWeeks: Number(form.durationWeeks) || 0,
      fee: Number(form.fee) || 0,
      admissionFee: Number(form.admissionFee) || 0,
      description: form.description,
      isActive: form.isActive,
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
          <Field label="Admission fee" hint="Added on top of the course fee; can be switched off per student">
            <input type="number" min={0} className={inputCls} value={form.admissionFee} onChange={set("admissionFee")} placeholder="0" />
          </Field>
          <Field label="Description" hint="Shown to students on their portal" className="sm:col-span-2">
            <textarea className={inputCls} rows={3} value={form.description} onChange={set("description")} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="accent-[#3F8CFF]" />
            Open for enrollment
          </label>
        </div>

        <p className="text-xs text-slate-500 rounded-xl bg-slate-50 px-3 py-2">
          Add modules, topics, links and files with the <b>Syllabus</b> button on the course after saving.
        </p>
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
  const [syllabusFor, setSyllabusFor] = useState(null); // course id
  const [coverageFor, setCoverageFor] = useState(null); // batch id
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
            subtitle={[MODE_LABELS[c.mode], c.durationWeeks ? `${c.durationWeeks} weeks` : null, c.fee ? fmtMoney(c.fee) : null, c.admissionFee ? `${fmtMoney(c.admissionFee)} admission` : null, c.syllabus?.length ? `${c.syllabus.length} modules` : null]
              .filter(Boolean)
              .join(" · ")}
            actions={
              <div className="flex flex-wrap justify-end gap-1.5">
                <button className={`${btnSmall} !border-[#3F8CFF] !text-[#3F8CFF]`} onClick={() => setSyllabusFor(c._id)}>
                  <FiBookOpen /> Syllabus
                </button>
                {p.manageCourses && (
                  <>
                    <button className={btnSmall} onClick={() => setBatchDrawer({ course: c })}>
                      <FiPlus /> Batch
                    </button>
                    <button className={btnSmall} onClick={() => setCourseDrawer(c)} aria-label="Edit course">
                      <FiEdit2 />
                    </button>
                    <button className={btnSmall} onClick={() => setConfirm({ type: "course", item: c })} aria-label="Delete course">
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
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
                  {
                    key: "trainer",
                    title: "Trainer / faculty",
                    className: "hidden md:table-cell",
                    render: (b) => (
                      <div className="text-xs">
                        <p className="text-slate-600">{b.trainerName || "—"}</p>
                        {b.facultyNames?.length > 0 && (
                          <p className="text-slate-400" title={b.facultyNames.join(", ")}>
                            + {b.facultyNames.length} module faculty
                          </p>
                        )}
                      </div>
                    ),
                  },
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
                  {
                    key: "syllabus",
                    title: "Syllabus covered",
                    render: (b) =>
                      b.syllabus?.total ? (
                        <button
                          className="group w-36 text-left"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setCoverageFor(b._id);
                          }}
                          title={p.manageCourses || p.markAttendance ? "Mark topics as completed and set module faculty" : "See what is covered"}
                        >
                          <span className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{b.syllabus.percent}%</span>
                            <span className="text-[#3F8CFF] font-semibold group-hover:underline">
                              {p.manageCourses || p.markAttendance ? "Mark" : "View"}
                            </span>
                          </span>
                          <span className="block h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${b.syllabus.percent}%` }} />
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No syllabus</span>
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
      <SyllabusDrawer course={courses.find((c) => c._id === syllabusFor)} canEdit={Boolean(p.manageCourses)} onClose={() => setSyllabusFor(null)} />
      <BatchSyllabusDrawer
        batchId={coverageFor}
        canMark={Boolean(p.manageCourses || p.markAttendance)}
        canAssign={Boolean(p.manageCourses)}
        onClose={() => setCoverageFor(null)}
      />
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
