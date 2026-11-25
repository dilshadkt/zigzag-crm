import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiAward, FiBookOpen, FiCalendar, FiClipboard, FiDollarSign, FiUsers } from "react-icons/fi";
import { Card, ErrorState, PageHeader, Spinner, StatCard, StatusBadge } from "../../accounts/components/ui";
import { useAcademyOverview } from "../hooks/useAcademy";
import { ENROLLMENT_STATUS, PAYMENT_MODE_LABELS, fmtCompact, fmtDay, fmtMoney } from "../utils";

const Overview = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAcademyOverview();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const s = data.stats;

  return (
    <div className="space-y-4">
      <PageHeader title="Overview" subtitle={`Today, ${fmtDay(data.today)}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active students" value={s.activeStudents} sub={`${s.totalStudents} in total`} icon={FiUsers} onClick={() => navigate("/academy/students")} />
        <StatCard label="Ongoing batches" value={s.ongoingBatches} sub={`${s.activeCourses} open courses`} icon={FiBookOpen} onClick={() => navigate("/academy/courses")} />
        <StatCard label="Collected this month" value={fmtCompact(s.collectedThisMonth)} tone="good" icon={FiDollarSign} onClick={() => navigate("/academy/fees")} />
        <StatCard
          label="Overdue fees"
          value={fmtCompact(s.overdueAmount)}
          sub={`${s.overdueStudents} enrollment${s.overdueStudents === 1 ? "" : "s"} · ${fmtCompact(s.outstanding)} outstanding`}
          tone={s.overdueAmount > 0 ? "bad" : "default"}
          icon={FiAlertCircle}
          onClick={() => navigate("/academy/fees")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Needs attention" className="lg:col-span-1">
          <ul className="space-y-3 text-sm">
            <li>
              <button className="flex items-center gap-3 w-full text-left hover:text-[#3F8CFF]" onClick={() => navigate("/academy/tasks")}>
                <FiClipboard className="text-amber-500 shrink-0" />
                <span>
                  <b>{s.submissionsToReview}</b> submission{s.submissionsToReview === 1 ? "" : "s"} to review
                </span>
              </button>
            </li>
            <li>
              <button className="flex items-center gap-3 w-full text-left hover:text-[#3F8CFF]" onClick={() => navigate("/academy/certificates")}>
                <FiAward className="text-violet-500 shrink-0" />
                <span>Certificates for completed students</span>
              </button>
            </li>
            <li className="pt-2 border-t border-slate-100">
              <p className="flex items-center gap-3 font-semibold text-slate-700 mb-2">
                <FiCalendar className="text-slate-400" /> Attendance not marked today
              </p>
              {data.unmarkedToday.length === 0 ? (
                <p className="text-xs text-emerald-600 pl-7">Every class today is marked.</p>
              ) : (
                <ul className="space-y-1 pl-7">
                  {data.unmarkedToday.map((b) => (
                    <li key={b._id}>
                      <button className="text-xs text-left hover:text-[#3F8CFF]" onClick={() => navigate(`/academy/attendance?batch=${b._id}`)}>
                        <b>{b.course}</b> · {b.name}
                        {b.timing ? ` · ${b.timing}` : ""}
                        {b.trainer ? <span className="text-slate-400"> · {b.trainer}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </Card>

        <Card title="Enrollments by status">
          <ul className="space-y-2">
            {Object.keys(ENROLLMENT_STATUS).map((k) => (
              <li key={k} className="flex items-center justify-between">
                <StatusBadge status={k} map={ENROLLMENT_STATUS} />
                <span className="text-sm font-bold text-slate-700 tabular-nums">{s.enrollmentsByStatus[k] || 0}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Latest payments">
          {data.recentPayments.length === 0 ? (
            <p className="text-xs text-slate-400">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {data.recentPayments.map((p) => (
                <li key={p._id}>
                  <button className="flex items-center justify-between gap-3 w-full py-2 text-left" onClick={() => navigate(`/academy/students/${p.student?._id}`)}>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-700 truncate">{p.student?.name}</span>
                      <span className="block text-xs text-slate-400">
                        {fmtDay(p.date)} · {PAYMENT_MODE_LABELS[p.mode] || p.mode}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-emerald-700 tabular-nums">{fmtMoney(p.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Overview;
