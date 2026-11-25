import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiAward, FiCalendar, FiCheckCircle, FiChevronRight, FiClipboard, FiCreditCard, FiTrendingUp } from "react-icons/fi";
import { usePortal } from "../portalContext";
import { studentApi } from "../studentClient";
import { Bar, NoEnrollment, PageTitle, Panel, PanelLink, Pill, StatTile } from "../ui";
import { TASK_STATUS, isOpenTask, statusOf } from "../taskStatus";
import { ATTENDANCE_STATUS, CLASS_DAYS, ENROLLMENT_STATUS, fmtDay, fmtMoney, fmtPercent, dayKey, todayKey } from "../../utils";

const daysBetween = (from, to) => Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000);

/** Where today falls between the batch start and end, in weeks. */
const courseTimeline = (batch) => {
  const start = dayKey(batch?.startDate);
  const end = dayKey(batch?.endDate);
  if (!start || !end) return null;
  const total = Math.max(1, daysBetween(start, end));
  const done = Math.max(0, Math.min(total, daysBetween(start, todayKey())));
  const weeks = Math.max(1, Math.ceil(total / 7));
  return {
    start,
    end,
    weeks,
    week: Math.min(weeks, Math.floor(done / 7) + 1),
    percent: (done / total) * 100,
    upcoming: todayKey() < start,
  };
};

const Detail = ({ label, value }) => (
  <div className="rounded-2xl bg-[#F4F9FD] px-4 py-3 min-w-0">
    <p className="text-[11px] font-semibold text-[#91929E]">{label}</p>
    <p className="text-sm font-bold text-[#0A1629] mt-0.5 break-words">{value || "—"}</p>
  </div>
);

const Home = () => {
  const { student, enrollment: e } = usePortal();
  const first = student.name.split(" ")[0];
  const tasksQuery = useQuery({ queryKey: ["student-portal", "tasks"], queryFn: studentApi.tasks });
  const attendanceQuery = useQuery({ queryKey: ["student-portal", "attendance"], queryFn: studentApi.attendance });

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  if (!e) {
    return (
      <div>
        <PageTitle title={`Welcome, ${first} 👋`} subtitle={today} />
        <NoEnrollment />
      </div>
    );
  }

  const batchTasks = (tasksQuery.data?.tasks || []).filter((t) => t.batch?._id === e.batch?._id);
  const openTasks = batchTasks.filter(isOpenTask).sort((a, b) => String(a.dueDate || "9").localeCompare(String(b.dueDate || "9")));
  const feedback = batchTasks
    .filter((t) => t.submission?.status === "reviewed")
    .sort((a, b) => String(b.submission.reviewedAt).localeCompare(String(a.submission.reviewedAt)))
    .slice(0, 2);
  const attendance = (attendanceQuery.data?.batches || []).find((b) => b.batch._id === e.batch?._id);
  const recentDays = (attendance?.days || []).slice(0, 7).reverse();

  const fees = e.feeSummary;
  const attended = (e.attendance?.present || 0) + (e.attendance?.late || 0);
  const counted = (e.attendance?.total || 0) - (e.attendance?.excused || 0);
  const lowAttendance = e.attendance?.percent !== null && e.attendance?.percent < 75;
  const timeline = courseTimeline(e.batch);
  const classDays = (e.batch?.classDays || []).map((d) => CLASS_DAYS.find(([k]) => k === d)?.[1]).filter(Boolean);

  return (
    <div>
      <PageTitle
        title={`Welcome back, ${first} 👋`}
        subtitle={`${today} · Student ID ${student.studentId}`}
        actions={<Pill status={e.status} map={ENROLLMENT_STATUS} />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        <StatTile
          to="/student/attendance"
          icon={FiCalendar}
          tone={lowAttendance ? "red" : "green"}
          label="Attendance"
          value={fmtPercent(e.attendance?.percent)}
          sub={`${attended} of ${counted} classes`}
          alert={lowAttendance}
        />
        <StatTile
          to="/student/tasks"
          icon={FiClipboard}
          tone="amber"
          label="Tasks submitted"
          value={`${e.tasks?.submitted || 0}/${e.tasks?.total || 0}`}
          sub={e.tasks?.overdue ? `${e.tasks.overdue} overdue` : e.tasks?.pending ? `${e.tasks.pending} to do` : "All caught up"}
          alert={Boolean(e.tasks?.overdue)}
        />
        <StatTile
          to="/student/tasks"
          icon={FiTrendingUp}
          tone="violet"
          label="Average score"
          value={fmtPercent(e.tasks?.averageScorePercent)}
          sub={`${e.tasks?.reviewed || 0} task${e.tasks?.reviewed === 1 ? "" : "s"} reviewed`}
        />
        <StatTile
          to="/student/fees"
          icon={FiCreditCard}
          tone={fees.overdueAmount > 0 ? "red" : "blue"}
          label="Fee balance"
          value={fees.balance > 0 ? `₹${fees.balance.toLocaleString("en-IN")}` : "Paid"}
          sub={
            fees.overdueAmount > 0
              ? `₹${fees.overdueAmount.toLocaleString("en-IN")} overdue`
              : fees.nextDue
              ? `Next due ${fmtDay(fees.nextDue.dueDate)}`
              : "Nothing pending"
          }
          alert={fees.overdueAmount > 0}
        />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 items-start">
        <div className="space-y-3 min-w-0">
          <Panel title="Current course" action={<PanelLink to="/student/course">View syllabus</PanelLink>}>
            <h3 className="text-lg font-bold text-[#0A1629]">{e.course?.name}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
              <Detail label="Batch" value={e.batch?.name || "Not assigned yet"} />
              <Detail label="Timing" value={e.batch?.timing} />
              <Detail label="Class days" value={classDays.join(", ")} />
              <Detail label="Trainer" value={e.batch?.trainerName} />
            </div>
            {timeline && (
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-bold text-[#0A1629]">
                    {e.status === "completed"
                      ? "Course completed"
                      : timeline.upcoming
                      ? `Starts ${fmtDay(timeline.start)}`
                      : `Week ${timeline.week} of ${timeline.weeks}`}
                  </p>
                  <p className="text-xs text-[#91929E]">
                    {fmtDay(timeline.start)} – {fmtDay(timeline.end)}
                  </p>
                </div>
                <Bar percent={e.status === "completed" ? 100 : timeline.percent} label="Course timeline" />
              </div>
            )}
            {e.syllabus?.total > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-bold text-[#0A1629]">Syllabus covered {e.syllabus.percent}%</p>
                  <p className="text-xs text-[#91929E]">
                    {e.syllabus.modulesDone} of {e.syllabus.modulesTotal} modules completed
                  </p>
                </div>
                <Bar percent={e.syllabus.percent} color="bg-emerald-500" label="Syllabus covered" />
              </div>
            )}
          </Panel>

          <Panel title="Tasks to do" action={<PanelLink to="/student/tasks">All tasks</PanelLink>}>
            {tasksQuery.isLoading ? (
              <p className="text-sm text-[#91929E]">Loading…</p>
            ) : openTasks.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-[#7D8592]">
                <FiCheckCircle className="text-emerald-500" /> You are all caught up.
              </p>
            ) : (
              <ul className="space-y-2">
                {openTasks.slice(0, 4).map((t) => (
                  <li key={t._id}>
                    <Link to="/student/tasks" className="flex items-center gap-3 rounded-2xl border border-[#EEF3F9] px-4 py-3 hover:border-[#3F8CFF]/40 transition-colors">
                      <span className="w-10 h-10 shrink-0 rounded-xl bg-[#ECF3FF] text-[#3F8CFF] flexCenter">
                        <FiClipboard />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-[#0A1629] truncate">{t.title}</span>
                        <span className="block text-xs text-[#91929E]">{t.dueDate ? `Due ${fmtDay(t.dueDate)}` : "No due date"}</span>
                      </span>
                      <Pill status={statusOf(t)} map={TASK_STATUS} />
                      <FiChevronRight className="text-slate-300 shrink-0 hidden sm:block" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {feedback.length > 0 && (
            <Panel title="Latest feedback">
              <ul className="grid md:grid-cols-2 gap-2">
                {feedback.map((t) => (
                  <li key={t._id} className="rounded-2xl bg-[#F4F9FD] p-4 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-[#0A1629]">{t.title}</p>
                      {t.submission.score !== undefined && t.submission.score !== null && (
                        <span className="shrink-0 text-sm font-bold text-emerald-600 tabular-nums">
                          {t.submission.score}/{t.maxScore}
                        </span>
                      )}
                    </div>
                    {t.submission.feedback && <p className="text-sm text-[#7D8592] mt-1.5">“{t.submission.feedback}”</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-1 gap-3 min-w-0 items-start">
          <Panel title="Fees" action={<PanelLink to="/student/fees">Details</PanelLink>}>
            <div className="flex items-end justify-between gap-3 mb-2">
              <p className="text-2xl font-bold text-[#0A1629] tabular-nums">{fmtMoney(fees.paid)}</p>
              <p className="text-xs text-[#91929E] pb-1">of {fmtMoney(fees.net)} paid</p>
            </div>
            <Bar percent={fees.net ? (fees.paid / fees.net) * 100 : 100} color="bg-emerald-500" label="Fees paid" />
            {fees.nextDue ? (
              <div className={`mt-4 rounded-2xl px-4 py-3 ${fees.nextDue.status === "overdue" ? "bg-red-50" : "bg-[#F4F9FD]"}`}>
                <p className={`text-[11px] font-semibold ${fees.nextDue.status === "overdue" ? "text-red-600" : "text-[#91929E]"}`}>
                  {fees.nextDue.status === "overdue" ? "Overdue payment" : "Next payment"}
                </p>
                <p className="text-sm font-bold text-[#0A1629] mt-0.5">
                  {fmtMoney(fees.nextDue.pending)} by {fmtDay(fees.nextDue.dueDate)}
                </p>
              </div>
            ) : (
              fees.balance === 0 && <p className="mt-4 text-sm text-emerald-600 font-semibold">Fully paid. Thank you!</p>
            )}
          </Panel>

          <Panel title="Recent classes" action={<PanelLink to="/student/attendance">All classes</PanelLink>}>
            {recentDays.length === 0 ? (
              <p className="text-sm text-[#91929E]">{attendanceQuery.isLoading ? "Loading…" : "No classes marked yet."}</p>
            ) : (
              <ul className="grid grid-cols-7 gap-1.5">
                {recentDays.map((d) => (
                  <li key={d.day} className="text-center" title={`${fmtDay(d.day)}: ${ATTENDANCE_STATUS[d.status]?.label}`}>
                    <span className={`flexCenter h-10 rounded-xl text-xs font-bold ${ATTENDANCE_STATUS[d.status]?.soft}`}>
                      {ATTENDANCE_STATUS[d.status]?.short}
                      <span className="sr-only">{ATTENDANCE_STATUS[d.status]?.label}</span>
                    </span>
                    <span className="block text-[10px] text-[#91929E] mt-1">{Number(d.day.slice(8))}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-[#91929E] mt-3">P present · L late · A absent · E excused</p>
          </Panel>

          <Panel title="Certificate" className="md:col-span-2 xl:col-span-1">
            <Link to="/student/certificate" className="flex items-center gap-3">
              <span className={`w-12 h-12 shrink-0 rounded-2xl flexCenter ${e.certificate ? "bg-violet-50 text-violet-600" : "bg-[#F4F9FD] text-[#91929E]"}`}>
                <FiAward className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#0A1629]">{e.certificate ? "Ready to download" : "Not issued yet"}</span>
                <span className="block text-xs text-[#91929E]">{e.certificate ? `No. ${e.certificate.number}` : "Available after you complete the course"}</span>
              </span>
              <FiChevronRight className="text-slate-300" />
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Home;
