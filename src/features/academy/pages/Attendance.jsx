import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiCalendar, FiCheck } from "react-icons/fi";
import { Card, EmptyState, ErrorState, Field, PageHeader, SegmentedTabs, Spinner, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "../../accounts/components/ui";
import { useAttendanceDay, useAttendanceMonth, useCourses, useDeleteAttendance, useSaveAttendance } from "../hooks/useAcademy";
import { useAcademy } from "../context";
import { ATTENDANCE_STATUS, fmtDay, fmtPercent, todayKey } from "../utils";

const STATUS_ORDER = ["present", "late", "absent", "excused"];

const DaySheet = ({ batch, canMark }) => {
  const [day, setDay] = useState(todayKey());
  const { data, isLoading, isError, error, refetch } = useAttendanceDay({ batch, day });
  const save = useSaveAttendance();
  const clear = useDeleteAttendance();
  const [marks, setMarks] = useState({});
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (!data) return;
    setMarks(Object.fromEntries(data.rows.map((r) => [r.student._id, r.status])));
    setTopic(data.topic || "");
  }, [data]);

  const rows = data?.rows || [];
  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
    rows.forEach((r) => (marks[r.student._id] ? (c[marks[r.student._id]] += 1) : (c.unmarked += 1)));
    return c;
  }, [rows, marks]);

  const markAll = (status) => setMarks(Object.fromEntries(rows.map((r) => [r.student._id, status])));
  const submit = () =>
    save.mutate({
      batch,
      day,
      topic,
      records: Object.entries(marks)
        .filter(([, status]) => status)
        .map(([student, status]) => ({ student, status })),
    });

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-end gap-3 p-4 border-b border-slate-100">
        <Field label="Class day" className="w-44">
          <input type="date" className={inputCls} value={day} max={todayKey()} onChange={(e) => e.target.value && setDay(e.target.value)} />
        </Field>
        <Field label="Topic covered" className="flex-1 min-w-[200px]">
          <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Meta Ads – audiences" disabled={!canMark} />
        </Field>
        {canMark && rows.length > 0 && (
          <button className={`${btnGhost} h-10`} onClick={() => markAll("present")}>
            <FiCheck /> All present
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No students in this batch" text="Enroll students into the batch first." />
      ) : (
        <>
          <ul className="divide-y divide-slate-50">
            {rows.map((r) => (
              <li key={r.student._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{r.student.name}</p>
                  <p className="text-xs text-slate-400">
                    {r.student.studentId}
                    {r.enrollmentStatus !== "ongoing" && r.enrollmentStatus !== "enrolled" ? ` · ${r.enrollmentStatus.replace("_", " ")}` : ""}
                  </p>
                </div>
                <div className="flex gap-1" role="radiogroup" aria-label={`Attendance for ${r.student.name}`}>
                  {STATUS_ORDER.map((s) => {
                    const active = marks[r.student._id] === s;
                    return (
                      <button
                        key={s}
                        role="radio"
                        aria-checked={active}
                        title={ATTENDANCE_STATUS[s].label}
                        disabled={!canMark}
                        onClick={() => setMarks((m) => ({ ...m, [r.student._id]: active ? null : s }))}
                        className={`w-9 h-9 rounded-lg text-xs font-bold border transition-colors ${
                          active ? `${ATTENDANCE_STATUS[s].cls} border-transparent` : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {ATTENDANCE_STATUS[s].short}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              {counts.present} present · {counts.late} late · {counts.absent} absent · {counts.excused} excused
              {counts.unmarked ? <span className="text-amber-600"> · {counts.unmarked} not marked</span> : null}
              {data?.isSaved ? <span className="text-emerald-600"> · saved</span> : null}
            </p>
            {canMark && (
              <div className="flex gap-2">
                {data?.isSaved && (
                  <button className={btnSmall} onClick={() => clear.mutate({ batch, day })} disabled={clear.isPending}>
                    Clear day
                  </button>
                )}
                <button className={btnPrimary} onClick={submit} disabled={save.isPending || counts.unmarked === rows.length}>
                  {save.isPending ? "Saving…" : "Save attendance"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

const MonthGrid = ({ batch }) => {
  const [month, setMonth] = useState(todayKey().slice(0, 7));
  const { data, isLoading, isError, error, refetch } = useAttendanceMonth({ batch, month });

  return (
    <Card padded={false}>
      <div className="flex items-end gap-3 p-4 border-b border-slate-100">
        <Field label="Month" className="w-44">
          <input type="month" className={inputCls} value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </Field>
        <p className="text-xs text-slate-500 pb-3">{data?.days?.length || 0} classes marked</p>
      </div>
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.days?.length ? (
        <EmptyState icon={FiCalendar} title="No classes marked this month" />
      ) : (
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="sticky left-0 bg-white text-left px-4 py-2 font-semibold min-w-[180px]">Student</th>
                <th className="px-2 py-2 font-semibold">%</th>
                {data.days.map((d) => (
                  <th key={d.day} className="px-1 py-2 font-semibold" title={d.topic || fmtDay(d.day)}>
                    {Number(d.day.slice(8))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.student._id} className="border-b border-slate-50">
                  <td className="sticky left-0 bg-white px-4 py-1.5 font-semibold text-slate-700 whitespace-nowrap">{r.student.name}</td>
                  <td className={`px-2 text-center font-bold ${r.summary.percent !== null && r.summary.percent < 75 ? "text-red-600" : "text-slate-700"}`}>
                    {fmtPercent(r.summary.percent)}
                  </td>
                  {r.marks.map((m, i) => (
                    <td key={i} className="px-0.5 py-1 text-center">
                      {m ? (
                        <span className={`inline-flex w-6 h-6 items-center justify-center rounded-md font-bold ${ATTENDANCE_STATUS[m].soft}`}>
                          {ATTENDANCE_STATUS[m].short}
                        </span>
                      ) : (
                        <span className="text-slate-300">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

const Attendance = () => {
  const { permissions: p } = useAcademy();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState("day");
  const { data, isLoading } = useCourses();

  const batches = useMemo(
    () =>
      (data?.courses || []).flatMap((c) => c.batches.map((b) => ({ ...b, courseName: c.name }))).sort((a, b) => {
        const rank = { ongoing: 0, upcoming: 1, completed: 2 };
        return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      }),
    [data]
  );
  const batch = params.get("batch") || batches.find((b) => b.status === "ongoing")?._id || batches[0]?._id || "";

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Class attendance" subtitle="Mark who attended each class. Late counts as attended; excused days are left out of the percentage." />
      {batches.length === 0 ? (
        <Card>
          <EmptyState icon={FiCalendar} title="No batches yet" text="Create a course and a batch first." />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select className={`${selectCls} !w-auto min-w-[260px]`} value={batch} onChange={(e) => setParams({ batch: e.target.value })} aria-label="Batch">
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.courseName} · {b.name}
                  {b.status !== "ongoing" ? ` (${b.status})` : ""}
                </option>
              ))}
            </select>
            <SegmentedTabs
              value={view}
              onChange={setView}
              tabs={[
                { value: "day", label: "Mark a day" },
                { value: "month", label: "Month view" },
              ]}
            />
          </div>
          {view === "day" ? <DaySheet key={batch} batch={batch} canMark={Boolean(p.markAttendance)} /> : <MonthGrid key={batch} batch={batch} />}
        </div>
      )}
    </div>
  );
};

export default Attendance;
