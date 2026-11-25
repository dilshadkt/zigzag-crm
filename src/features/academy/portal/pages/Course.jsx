import React from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiClock, FiDownload, FiExternalLink, FiUser } from "react-icons/fi";
import studentClient from "../studentClient";
import { openProtectedFile } from "../../api/academyApi";
import { usePortal } from "../portalContext";
import { Bar, InfoRow, NoEnrollment, PageTitle, Panel, Pill } from "../ui";
import { CLASS_DAYS, ENROLLMENT_STATUS, MODE_LABELS, durationText, fmtDay, fmtSize } from "../../utils";

const MODULE_STATUS = {
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
  progress: { label: "In progress", cls: "bg-blue-50 text-blue-700" },
  upcoming: { label: "Coming up", cls: "bg-slate-100 text-slate-500" },
};

const chip = "inline-flex items-center gap-2 max-w-full rounded-xl bg-[#F4F9FD] px-3 py-2 text-xs font-bold text-[#3F8CFF] hover:bg-[#ECF3FF]";

const Module = ({ module: m, number, enrollmentId }) => {
  const status = m.completed ? "completed" : m.done > 0 ? "progress" : "upcoming";
  const open = (file) =>
    openProtectedFile(studentClient, `/enrollments/${enrollmentId}/modules/${m._id}/files/${file._id}`, { fileName: file.name }).catch(() =>
      toast.error("Could not open the file")
    );

  return (
    <li className="rounded-2xl border border-[#EEF3F9] p-4 flex gap-3 min-w-0">
      <span
        className={`w-9 h-9 shrink-0 rounded-xl text-sm font-bold flexCenter ${
          m.completed ? "bg-emerald-500 text-white" : "bg-[#ECF3FF] text-[#3F8CFF]"
        }`}
      >
        {m.completed ? <FiCheck aria-hidden="true" /> : number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0A1629]">{m.title}</p>
            {m.faculty && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#7D8592] mt-0.5">
                <FiUser aria-hidden="true" /> {m.faculty.name}
              </p>
            )}
            {(durationText(m) || m.completed) && (
              <p className="flex items-center gap-1.5 text-xs text-[#91929E] mt-0.5">
                {durationText(m) && (
                  <>
                    <FiClock aria-hidden="true" /> {durationText(m)}
                  </>
                )}
                {m.completed && <span>{durationText(m) ? "· " : ""}Completed {fmtDay(m.completedAt)}</span>}
              </p>
            )}
          </div>
          <Pill status={status} map={MODULE_STATUS} />
        </div>

        {m.description && <p className="text-sm text-[#7D8592] mt-2 whitespace-pre-line">{m.description}</p>}

        {m.topics?.length > 0 && (
          <ul className="grid md:grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
            {m.topics.map((t) => (
              <li key={t._id} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 w-4 h-4 shrink-0 rounded-full flexCenter ${t.done ? "bg-emerald-500 text-white" : "border-2 border-slate-200"}`}
                  title={t.done ? `Completed ${fmtDay(t.completedAt)}` : "Not covered yet"}
                >
                  {t.done && <FiCheck className="w-2.5 h-2.5" aria-hidden="true" />}
                </span>
                <span className={t.done ? "text-[#0A1629]" : "text-[#7D8592]"}>
                  {t.title}
                  <span className="sr-only">{t.done ? " (completed)" : " (not covered yet)"}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {(m.links?.length > 0 || m.files?.length > 0) && (
          <div className="mt-3 pt-3 border-t border-[#EEF3F9]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#91929E] mb-2">Study material</p>
            <div className="flex flex-wrap gap-2">
              {(m.links || []).map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className={chip}>
                  <FiExternalLink className="shrink-0" />
                  <span className="truncate">{link.label || link.url.replace(/^https?:\/\/(www\.)?/i, "")}</span>
                </a>
              ))}
              {(m.files || []).map((file) => (
                <button key={file._id} type="button" onClick={() => open(file)} className={chip}>
                  <FiDownload className="shrink-0" />
                  <span className="truncate">{file.name}</span>
                  {file.size ? <span className="shrink-0 font-normal text-[#91929E]">{fmtSize(file.size)}</span> : null}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

const Course = () => {
  const { enrollment: e } = usePortal();
  if (!e) return <NoEnrollment />;
  const c = e.course || {};
  const days = (e.batch?.classDays || []).map((d) => CLASS_DAYS.find(([k]) => k === d)?.[1]).filter(Boolean);
  const syllabus = e.syllabus;

  return (
    <div>
      <PageTitle title={c.name} subtitle={[MODE_LABELS[c.mode], c.durationWeeks ? `${c.durationWeeks} weeks` : null].filter(Boolean).join(" · ")} />

      <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 items-start">
        <Panel title="Your batch" className="xl:order-last xl:sticky xl:top-0">
          <dl>
            <InfoRow label="Status" value={<Pill status={e.status} map={ENROLLMENT_STATUS} />} />
            <InfoRow label="Batch" value={e.batch?.name || "Not assigned yet"} />
            <InfoRow label="Timing" value={e.batch?.timing} />
            <InfoRow label="Class days" value={days.join(", ")} />
            <InfoRow label="Starts" value={e.batch?.startDate ? fmtDay(e.batch.startDate) : null} />
            <InfoRow label="Ends" value={e.batch?.endDate ? fmtDay(e.batch.endDate) : null} />
            <InfoRow label="Trainer" value={e.batch?.trainerName} />
            <InfoRow label="Enrolled on" value={fmtDay(e.enrolledAt)} />
          </dl>
        </Panel>

        <div className="space-y-3 min-w-0">
          {c.description && (
            <Panel title="About the course">
              <p className="text-sm text-[#7D8592] whitespace-pre-line leading-relaxed">{c.description}</p>
            </Panel>
          )}
          <Panel
            title="Syllabus"
            subtitle={syllabus?.modulesTotal ? `${syllabus.modulesDone} of ${syllabus.modulesTotal} modules completed` : undefined}
            action={syllabus?.total ? <span className="text-xl font-bold text-emerald-600 tabular-nums">{syllabus.percent}%</span> : null}
          >
            {!syllabus?.modules?.length ? (
              <p className="text-sm text-[#91929E]">The syllabus will be shared soon.</p>
            ) : (
              <>
                <Bar percent={syllabus.percent} color="bg-emerald-500" label="Syllabus covered" />
                <ol className="space-y-3 mt-4">
                  {syllabus.modules.map((m, i) => (
                    <Module key={m._id} module={m} number={i + 1} enrollmentId={e._id} />
                  ))}
                </ol>
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Course;
