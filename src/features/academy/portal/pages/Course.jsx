import React from "react";
import { usePortal } from "../portalContext";
import { InfoRow, NoEnrollment, PageTitle, Panel, Pill } from "../ui";
import { CLASS_DAYS, ENROLLMENT_STATUS, MODE_LABELS, fmtDay } from "../../utils";

const Course = () => {
  const { enrollment: e } = usePortal();
  if (!e) return <NoEnrollment />;
  const c = e.course || {};
  const days = (e.batch?.classDays || []).map((d) => CLASS_DAYS.find(([k]) => k === d)?.[1]).filter(Boolean);

  return (
    <div>
      <PageTitle title={c.name} subtitle={[MODE_LABELS[c.mode], c.durationWeeks ? `${c.durationWeeks} weeks` : null].filter(Boolean).join(" · ")} />

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 items-start">
        <Panel title="Your batch">
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
          <Panel title="Syllabus" subtitle={c.syllabus?.length ? `${c.syllabus.length} modules` : undefined}>
            {!c.syllabus?.length ? (
              <p className="text-sm text-[#91929E]">The syllabus will be shared soon.</p>
            ) : (
              <ol className="grid md:grid-cols-2 gap-3">
                {c.syllabus.map((m, i) => (
                  <li key={i} className="rounded-2xl border border-[#EEF3F9] p-4 flex gap-3 min-w-0">
                    <span className="w-9 h-9 shrink-0 rounded-xl bg-[#ECF3FF] text-[#3F8CFF] text-sm font-bold flexCenter">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0A1629]">{m.title}</p>
                      {m.topics?.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {m.topics.map((t, j) => (
                            <li key={j} className="flex gap-2 text-sm text-[#7D8592]">
                              <span className="mt-2 w-1 h-1 shrink-0 rounded-full bg-[#3F8CFF]" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Course;
