import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiClipboard, FiDownload, FiEdit2, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi";
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
import { useCourses, useCreateTask, useDeleteTask, useReviewSubmission, useSubmissions, useTasks, useUpdateTask } from "../hooks/useAcademy";
import { academyApi } from "../api/academyApi";
import { useAcademy } from "../context";
import { SUBMISSION_STATUS, dayKey, errorMessage, fmtDateTime, fmtDay, fmtSize, todayKey } from "../utils";

const emptyTask = (batch) => ({ batch: batch || "", title: "", description: "", dueDate: "", maxScore: 10, submissionType: "either", isPublished: true });

const TaskDrawer = ({ task, batches, defaultBatch, isOpen, onClose }) => {
  const [form, setForm] = useState(emptyTask);
  const create = useCreateTask();
  const update = useUpdateTask();
  const busy = create.isPending || update.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setForm(task ? { ...emptyTask(), ...task, batch: task.batch?._id || task.batch, dueDate: dayKey(task.dueDate) } : emptyTask(defaultBatch));
  }, [isOpen, task, defaultBatch]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const submit = () => {
    const body = { ...form, dueDate: form.dueDate || null, maxScore: Number(form.maxScore) || 0 };
    if (task?._id) update.mutate({ id: task._id, ...body }, { onSuccess: onClose });
    else create.mutate(body, { onSuccess: onClose });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={task?._id ? "Edit task" : "New task"}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button className={btnPrimary} onClick={submit} disabled={!form.title.trim() || !form.batch || busy}>
            {busy ? "Saving…" : "Save task"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Batch" required>
          <select className={selectCls} value={form.batch} onChange={set("batch")} disabled={Boolean(task?._id)}>
            <option value="">Choose a batch</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.courseName} · {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title" required>
          <input className={inputCls} value={form.title} onChange={set("title")} placeholder="e.g. Create a Meta ad campaign for a local bakery" />
        </Field>
        <Field label="Instructions">
          <textarea className={inputCls} rows={6} value={form.description} onChange={set("description")} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Due date">
            <input type="date" className={inputCls} value={form.dueDate} min={task?._id ? undefined : todayKey()} onChange={set("dueDate")} />
          </Field>
          <Field label="Max score">
            <input type="number" min={0} className={inputCls} value={form.maxScore} onChange={set("maxScore")} />
          </Field>
          <Field label="Student submits">
            <select className={selectCls} value={form.submissionType} onChange={set("submissionType")}>
              <option value="either">Link or file</option>
              <option value="link">A link</option>
              <option value="file">A file</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isPublished} onChange={set("isPublished")} className="accent-[#3F8CFF]" />
          Visible to students
        </label>
      </div>
    </Drawer>
  );
};

const ReviewForm = ({ row, maxScore, canReview }) => {
  const review = useReviewSubmission();
  const sub = row.submission;
  const [score, setScore] = useState(sub?.score ?? "");
  const [feedback, setFeedback] = useState(sub?.feedback || "");

  const open = async () => {
    try {
      await academyApi.openSubmissionFile(sub._id);
    } catch (error) {
      toast.error(errorMessage(error, "Could not open the file"));
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">{row.student?.name}</p>
          <p className="text-xs text-slate-400">
            {row.student?.studentId}
            {sub ? ` · ${fmtDateTime(sub.submittedAt)}` : ""}
            {sub?.isLate && <span className="text-amber-600 font-semibold"> · late</span>}
          </p>
        </div>
        <StatusBadge status={sub ? sub.status : "missing"} map={SUBMISSION_STATUS} />
      </div>
      {sub && (
        <>
          <div className="flex flex-wrap gap-2">
            {sub.link && (
              <a className={btnSmall} href={sub.link} target="_blank" rel="noreferrer">
                <FiExternalLink /> Open link
              </a>
            )}
            {sub.file && (
              <button className={btnSmall} onClick={open}>
                <FiDownload /> {sub.file.name} {fmtSize(sub.file.size) && `(${fmtSize(sub.file.size)})`}
              </button>
            )}
          </div>
          {sub.note && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{sub.note}</p>}
          {canReview && (
            <div className="grid grid-cols-[6rem_1fr] gap-2">
              <input
                type="number"
                min={0}
                max={maxScore || undefined}
                className={inputCls}
                placeholder={`/ ${maxScore}`}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                aria-label="Score"
              />
              <input className={inputCls} placeholder="Feedback for the student" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  className={btnSmall}
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: sub._id, status: "resubmit", feedback })}
                >
                  Ask to resubmit
                </button>
                <button
                  className={`${btnSmall} !bg-[#3F8CFF] !text-white !border-[#3F8CFF]`}
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: sub._id, status: "reviewed", score: score === "" ? undefined : Number(score), feedback })}
                >
                  {sub.status === "reviewed" ? "Update review" : "Mark reviewed"}
                </button>
              </div>
            </div>
          )}
          {!canReview && sub.feedback && <p className="text-xs text-slate-500">Feedback: {sub.feedback}</p>}
        </>
      )}
    </div>
  );
};

const SubmissionsDrawer = ({ taskId, onClose, canReview }) => {
  const { data, isLoading } = useSubmissions(taskId);
  const [filter, setFilter] = useState("all");
  if (!taskId) return null;
  const rows = (data?.rows || []).filter((r) => {
    if (filter === "all") return true;
    if (filter === "missing") return !r.submission;
    return r.submission?.status === filter;
  });
  return (
    <Drawer isOpen onClose={onClose} title={data?.task?.title || "Submissions"} subtitle={data?.task ? `${data.task.batch?.course?.name} · ${data.task.batch?.name} · due ${fmtDay(data.task.dueDate)}` : ""} width="max-w-2xl">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          <select className={`${selectCls} !w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Show">
            <option value="all">Everyone ({data?.rows?.length || 0})</option>
            <option value="submitted">To review</option>
            <option value="reviewed">Reviewed</option>
            <option value="resubmit">Resubmit asked</option>
            <option value="missing">Not submitted</option>
          </select>
          {rows.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nobody here.</p>}
          {rows.map((r) => (
            <ReviewForm key={`${r.student?._id}-${r.submission?._id}-${r.submission?.updatedAt}`} row={r} maxScore={data.task.maxScore} canReview={canReview} />
          ))}
        </div>
      )}
    </Drawer>
  );
};

const Tasks = () => {
  const { permissions: p } = useAcademy();
  const [batch, setBatch] = useState("");
  const { data: courseData } = useCourses();
  const { data, isLoading, isError, error, refetch } = useTasks(batch ? { batch } : undefined);
  const del = useDeleteTask();
  const [drawer, setDrawer] = useState(null);
  const [subsFor, setSubsFor] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const batches = useMemo(
    () => (courseData?.courses || []).flatMap((c) => c.batches.map((b) => ({ ...b, courseName: c.name }))),
    [courseData]
  );

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Assignments for each batch. Students submit a link or file on their portal; you review and score them here."
        actions={
          p.manageTasks && (
            <button className={btnPrimary} onClick={() => setDrawer({})} disabled={!batches.length}>
              <FiPlus /> New task
            </button>
          )
        }
      />
      <Card padded={false}>
        <div className="p-4 border-b border-slate-100">
          <select className={`${selectCls} !w-auto min-w-[240px]`} value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Batch">
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.courseName} · {b.name}
              </option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <Table
            rows={data?.tasks || []}
            onRowClick={(t) => setSubsFor(t._id)}
            empty={<EmptyState icon={FiClipboard} title="No tasks yet" text="Create a task for a batch and students will see it on their portal." />}
            columns={[
              {
                key: "title",
                title: "Task",
                render: (t) => (
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700">
                      {t.title}
                      {!t.isPublished && <span className="ml-2 text-[10px] font-semibold uppercase text-slate-400">hidden</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t.batch?.course?.name} · {t.batch?.name}
                    </p>
                  </div>
                ),
              },
              {
                key: "due",
                title: "Due",
                render: (t) => (
                  <span className={`text-xs ${t.dueDate && dayKey(t.dueDate) < todayKey() ? "text-slate-400" : "text-slate-600"}`}>{fmtDay(t.dueDate)}</span>
                ),
              },
              {
                key: "progress",
                title: "Submitted",
                render: (t) => {
                  const done = t.counts.submitted + t.counts.reviewed + t.counts.resubmit;
                  return (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700">
                        {done}/{t.students}
                      </span>
                      {t.counts.submitted > 0 && <span className="ml-2 text-amber-600 font-semibold">{t.counts.submitted} to review</span>}
                    </div>
                  );
                },
              },
              {
                key: "actions",
                title: "",
                align: "right",
                render: (t) =>
                  p.manageTasks && (
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button className={btnSmall} onClick={() => setDrawer(t)} aria-label="Edit task">
                        <FiEdit2 />
                      </button>
                      <button className={btnSmall} onClick={() => setConfirm(t)} aria-label="Delete task">
                        <FiTrash2 />
                      </button>
                    </div>
                  ),
              },
            ]}
          />
        )}
      </Card>

      <TaskDrawer isOpen={Boolean(drawer)} task={drawer?._id ? drawer : null} batches={batches} defaultBatch={batch} onClose={() => setDrawer(null)} />
      <SubmissionsDrawer taskId={subsFor} onClose={() => setSubsFor(null)} canReview={Boolean(p.manageTasks)} />
      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        title="Delete task?"
        message={`"${confirm?.title}" and every student submission for it will be deleted.`}
        confirmLabel="Delete"
        busy={del.isPending}
        onConfirm={() => del.mutate(confirm._id, { onSuccess: () => setConfirm(null) })}
      />
    </div>
  );
};

export default Tasks;
