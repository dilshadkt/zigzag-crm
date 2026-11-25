import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiExternalLink, FiPaperclip } from "react-icons/fi";
import studentClient, { studentApi } from "../studentClient";
import { openProtectedFile } from "../../api/academyApi";
import { PageTitle, Panel, Pill, Ring } from "../ui";
import { usePortal } from "../portalContext";
import { TASK_STATUS, isOpenTask, statusOf } from "../taskStatus";
import { fmtDateTime, fmtDay, fmtPercent, fmtSize } from "../../utils";

const SubmitForm = ({ task, onDone }) => {
  const queryClient = useQueryClient();
  const [link, setLink] = useState(task.submission?.link || "");
  const [note, setNote] = useState(task.submission?.note || "");
  const [file, setFile] = useState(null);
  const submit = useMutation({
    mutationFn: studentApi.submitTask,
    onSuccess: () => {
      toast.success("Submitted");
      queryClient.invalidateQueries({ queryKey: ["student-portal"] });
      onDone();
    },
    onError: (err) => toast.error(err?.message || "Could not submit"),
  });
  const needsLink = task.submissionType === "link";
  const needsFile = task.submissionType === "file" && !task.submission?.file;
  const ready = needsLink ? link.trim() : needsFile ? file : link.trim() || file || task.submission?.file;

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      {task.submissionType !== "file" && (
        <label className="block">
          <span className="block text-xs font-semibold text-slate-600 mb-1">Link {needsLink && <span className="text-red-500">*</span>}</span>
          <input
            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#3F8CFF]"
            placeholder="https://docs.google.com/…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            inputMode="url"
          />
        </label>
      )}
      {task.submissionType !== "link" && (
        <label className="block">
          <span className="block text-xs font-semibold text-slate-600 mb-1">
            File {needsFile && <span className="text-red-500">*</span>}
            {task.submission?.file && <span className="font-normal text-slate-400"> (leave empty to keep {task.submission.file.name})</span>}
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.gif,.zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:h-9 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold"
          />
          <span className="block text-[11px] text-slate-400 mt-1">PDF, Office, images or ZIP, up to 20 MB</span>
        </label>
      )}
      <label className="block">
        <span className="block text-xs font-semibold text-slate-600 mb-1">Note for your trainer</span>
        <textarea className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#3F8CFF]" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button
        disabled={!ready || submit.isPending}
        onClick={() => submit.mutate({ id: task._id, link: link.trim(), note, file })}
        className="w-full h-11 rounded-xl bg-[#3F8CFF] text-white font-semibold disabled:opacity-50"
      >
        {submit.isPending ? "Uploading…" : task.submission ? "Submit again" : "Submit"}
      </button>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const status = statusOf(task);
  const sub = task.submission;
  const canSubmit = !sub || sub.status !== "reviewed";

  const openFile = () =>
    openProtectedFile(studentClient, `/submissions/${sub._id}/file`).catch(() => toast.error("Could not open the file"));

  return (
    <Panel>
      <button className="w-full flex items-start justify-between gap-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">{task.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {task.dueDate ? `Due ${fmtDay(task.dueDate)}` : "No due date"} · {task.batch?.course?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Pill status={status} map={TASK_STATUS} />
          {open ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {task.description && <p className="text-sm text-slate-600 whitespace-pre-line">{task.description}</p>}
          {sub && (
            <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-sm">
              <p className="text-xs text-slate-500">
                Submitted {fmtDateTime(sub.submittedAt)}
                {sub.isLate && <span className="text-amber-600 font-semibold"> · late</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {sub.link && (
                  <a href={sub.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#3F8CFF] font-semibold text-xs">
                    <FiExternalLink /> Your link
                  </a>
                )}
                {sub.file && (
                  <button onClick={openFile} className="inline-flex items-center gap-1 text-[#3F8CFF] font-semibold text-xs">
                    <FiPaperclip /> {sub.file.name} {fmtSize(sub.file.size) && `(${fmtSize(sub.file.size)})`}
                  </button>
                )}
              </div>
              {(sub.status === "reviewed" || sub.feedback) && (
                <div className="pt-2 border-t border-slate-200">
                  {sub.status === "reviewed" && sub.score !== undefined && sub.score !== null && (
                    <p className="font-bold text-slate-800">
                      Score: {sub.score} / {task.maxScore}
                    </p>
                  )}
                  {sub.feedback && <p className="text-slate-600 mt-0.5">“{sub.feedback}”</p>}
                </div>
              )}
            </div>
          )}
          {canSubmit && (!sub || editing || sub.status === "resubmit") ? (
            <SubmitForm task={task} onDone={() => setEditing(false)} />
          ) : (
            canSubmit && (
              <button className="text-xs font-semibold text-[#3F8CFF]" onClick={() => setEditing(true)}>
                Change my submission
              </button>
            )
          )}
        </div>
      )}
    </Panel>
  );
};

const Tasks = () => {
  const { enrollment } = usePortal();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["student-portal", "tasks"], queryFn: studentApi.tasks });
  const [tab, setTab] = useState("open");
  const tasks = useMemo(() => data?.tasks || [], [data]);
  // soonest due date first; the API sends newest first
  const open = tasks.filter(isOpenTask).sort((a, b) => String(a.dueDate || "9").localeCompare(String(b.dueDate || "9")));
  const done = tasks.filter((t) => !isOpenTask(t));
  const shown = tab === "open" ? open : done;
  const progress = enrollment?.tasks;

  return (
    <div>
      <PageTitle
        title="Tasks"
        subtitle="Assignments from your trainer"
        actions={
          <div className="inline-flex p-1 bg-white rounded-[14px] gap-1">
            {[
              ["open", `To do (${open.length})`],
              ["done", `Submitted (${done.length})`],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 h-9 rounded-[10px] text-sm font-bold transition-colors ${tab === k ? "bg-[#3F8CFF] text-white" : "text-[#7D8592] hover:text-[#0A1629]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />
      <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 items-start">
        <div className="space-y-3 min-w-0">
          {isLoading ? (
            <Panel>
              <p className="text-sm text-[#91929E]">Loading…</p>
            </Panel>
          ) : isError ? (
            <Panel>
              <button className="text-sm font-bold text-[#3F8CFF]" onClick={() => refetch()}>
                Could not load tasks. Try again
              </button>
            </Panel>
          ) : shown.length === 0 ? (
            <Panel>
              <p className="text-sm text-[#7D8592] text-center py-8">{tab === "open" ? "Nothing to do right now 🎉" : "You have not submitted any tasks yet."}</p>
            </Panel>
          ) : (
            shown.map((t) => <TaskCard key={t._id} task={t} />)
          )}
        </div>

        {progress && (
          <Panel title="Your progress" subtitle={enrollment.course?.name} className="order-first xl:order-none">
            <div className="flex items-center gap-5">
              <Ring value={progress.completionPercent} size={96} label="Tasks submitted" />
              <dl className="flex-1 space-y-1.5 text-sm">
                {[
                  ["Submitted", `${progress.submitted} of ${progress.total}`],
                  ["To do", progress.pending],
                  ["Reviewed", progress.reviewed],
                  ["Average score", fmtPercent(progress.averageScorePercent)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-[#7D8592]">{label}</dt>
                    <dd className="font-bold text-[#0A1629] tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default Tasks;
