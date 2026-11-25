import React, { useEffect, useRef, useState } from "react";
import { ConfirmModal, Drawer, EmptyState, ErrorState, Spinner } from "../../accounts/components/ui";
import { FiBookOpen } from "react-icons/fi";
import { useBatchSyllabus, useSetBatchSyllabus } from "../hooks/useAcademy";
import { durationText, fmtDay } from "../utils";

const Tick = ({ checked, partial = false, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = partial && !checked;
  }, [partial, checked]);
  return <input ref={ref} type="checkbox" checked={checked} className="w-[18px] h-[18px] shrink-0 accent-emerald-600 cursor-pointer disabled:cursor-default" {...props} />;
};

/** Tick the modules and topics a batch has been taught. Each tick saves at once. */
const BatchSyllabusDrawer = ({ batchId, canMark, onClose }) => {
  const { data, isLoading, isError, error, refetch } = useBatchSyllabus(batchId);
  const set = useSetBatchSyllabus();
  const [confirm, setConfirm] = useState(null); // module to un-complete
  if (!batchId) return null;

  const syllabus = data?.syllabus;
  const mark = (items, done, options) => set.mutate({ id: batchId, items, done }, options);
  const itemsOf = (m) => (m.topics.length ? m.topics.map((t) => t._id) : [m._id]);
  const busy = set.isPending || !canMark;

  return (
    <>
      <Drawer
        isOpen
        onClose={onClose}
        title="Syllabus covered"
        subtitle={data ? `${data.course.name} · ${data.batch.name}` : ""}
        width="max-w-2xl"
      >
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !syllabus?.modules.length ? (
          <EmptyState icon={FiBookOpen} title="No syllabus yet" text="Add modules with the Syllabus button on the course, then tick them here as you teach." />
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-end justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-slate-800">
                  {syllabus.modulesDone} of {syllabus.modulesTotal} modules completed
                </p>
                <p className="text-xl font-bold text-emerald-600 tabular-nums">{syllabus.percent}%</p>
              </div>
              <div className="h-2 rounded-full bg-white overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${syllabus.percent}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {canMark ? "Tick topics as you teach them. Students see this on their portal." : "You can view this but not change it."}
              </p>
            </div>

            {syllabus.modules.map((m, index) => (
              <section key={m._id} className={`rounded-2xl border ${m.completed ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"}`}>
                <label className="flex items-start gap-3 p-3.5 cursor-pointer">
                  <Tick
                    checked={m.completed}
                    partial={m.done > 0}
                    disabled={busy}
                    onChange={() => (m.completed ? setConfirm(m) : mark(itemsOf(m), true))}
                    aria-label={`Mark module ${m.title} as completed`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">
                      {index + 1}. {m.title}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {[durationText(m), m.topics.length ? `${m.done} of ${m.total} topics` : ""].filter(Boolean).join(" · ")}
                    </span>
                    {m.description && <span className="block text-xs text-slate-500 mt-1">{m.description}</span>}
                  </span>
                  {m.completed ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                      Completed {fmtDay(m.completedAt)}
                    </span>
                  ) : (
                    canMark && <span className="shrink-0 text-[11px] font-semibold text-[#3F8CFF]">Mark completed</span>
                  )}
                </label>
                {m.topics.length > 0 && (
                  <ul className="border-t border-slate-100 py-1">
                    {m.topics.map((t) => (
                      <li key={t._id}>
                        <label className="flex items-center gap-3 pl-9 pr-3.5 py-1.5 cursor-pointer hover:bg-slate-50">
                          <Tick checked={t.done} disabled={busy} onChange={() => mark([t._id], !t.done)} />
                          <span className={`min-w-0 flex-1 text-sm ${t.done ? "text-slate-800" : "text-slate-600"}`}>{t.title}</span>
                          {t.done && <span className="text-[11px] text-slate-400">{fmtDay(t.completedAt)}</span>}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </Drawer>
      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title="Mark as not completed?"
        message={`All ticks for "${confirm?.title}" in this batch, with their dates, will be cleared.`}
        confirmLabel="Clear ticks"
        busy={set.isPending}
        onConfirm={() => mark(itemsOf(confirm), false, { onSuccess: () => setConfirm(null) })}
      />
    </>
  );
};

export default BatchSyllabusDrawer;
