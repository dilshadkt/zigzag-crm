import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiDollarSign } from "react-icons/fi";
import { Card, EmptyState, ErrorState, PageHeader, SegmentedTabs, Spinner, StatCard, StatusBadge, Table, btnGhost, selectCls } from "../../accounts/components/ui";
import { useCourses, useFeeDues } from "../hooks/useAcademy";
import { FEE_STATUS, PAYMENT_MODE_LABELS, downloadCsv, fmtDay, fmtMoney } from "../utils";

const Fees = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("dues");
  const [status, setStatus] = useState("open");
  const [course, setCourse] = useState("");
  const { data: courseData } = useCourses();
  const { data, isLoading, isError, error, refetch } = useFeeDues({ status, course });
  const totals = data?.totals || {};

  const exportDues = () =>
    downloadCsv(`fee-dues-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Student ID", "Student", "Phone", "Course", "Batch", "Instalment", "Due", "Amount", "Pending", "Status"],
      ...(data?.dues || []).map((d) => [
        d.student?.studentId,
        d.student?.name,
        d.student?.phone,
        d.course?.name,
        d.batch?.name,
        d.label,
        d.dueDate ? fmtDay(d.dueDate) : "",
        d.amount,
        d.pending,
        FEE_STATUS[d.status]?.label || d.status,
      ]),
    ]);

  const exportPayments = () =>
    downloadCsv(`fee-payments-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Date", "Student ID", "Student", "Course", "Amount", "Mode", "Reference"],
      ...(data?.payments || []).map((p) => [fmtDay(p.date), p.student?.studentId, p.student?.name, p.course?.name, p.amount, PAYMENT_MODE_LABELS[p.mode] || p.mode, p.reference]),
    ]);

  return (
    <div>
      <PageHeader title="Fees" subtitle="Upcoming and overdue instalments across all students, and payments received" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total fees" value={fmtMoney(totals.net)} />
        <StatCard label="Collected" value={fmtMoney(totals.paid)} tone="good" />
        <StatCard label="Outstanding" value={fmtMoney(totals.balance)} />
        <StatCard label="Overdue" value={fmtMoney(totals.overdue)} tone={totals.overdue > 0 ? "bad" : "default"} />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2">
            <SegmentedTabs
              value={view}
              onChange={setView}
              tabs={[
                { value: "dues", label: "Dues" },
                { value: "payments", label: "Payments" },
              ]}
            />
            {view === "dues" && (
              <select className={`${selectCls} !w-auto !h-10`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Show">
                <option value="open">Not yet paid</option>
                <option value="overdue">Overdue only</option>
                <option value="all">All instalments</option>
              </select>
            )}
            <select className={`${selectCls} !w-auto !h-10`} value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course">
              <option value="">All courses</option>
              {(courseData?.courses || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button className={btnGhost} onClick={view === "dues" ? exportDues : exportPayments} disabled={!data}>
            <FiDownload /> Export CSV
          </button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : view === "dues" ? (
          <Table
            rows={data.dues}
            rowKey={(d) => `${d.enrollment}-${d.installment || "bal"}`}
            onRowClick={(d) => navigate(`/academy/students/${d.student._id}`)}
            empty={<EmptyState icon={FiDollarSign} title="Nothing due" text="No instalments match." />}
            columns={[
              {
                key: "student",
                title: "Student",
                render: (d) => (
                  <div>
                    <p className="font-semibold text-slate-700">{d.student?.name}</p>
                    <p className="text-xs text-slate-400">
                      {d.student?.studentId} · {d.student?.phone}
                    </p>
                  </div>
                ),
              },
              { key: "course", title: "Course", className: "hidden md:table-cell", render: (d) => <span className="text-xs text-slate-600">{d.course?.name}</span> },
              { key: "label", title: "Instalment", render: (d) => <span className="text-xs text-slate-600">{d.label}</span> },
              { key: "dueDate", title: "Due", render: (d) => <span className="text-xs">{d.dueDate ? fmtDay(d.dueDate) : "—"}</span> },
              { key: "pending", title: "Pending", align: "right", render: (d) => <span className="font-semibold">{fmtMoney(d.pending)}</span> },
              { key: "status", title: "", align: "right", render: (d) => <StatusBadge status={d.status} map={FEE_STATUS} /> },
            ]}
          />
        ) : (
          <Table
            rows={data.payments}
            onRowClick={(p) => navigate(`/academy/students/${p.student._id}`)}
            empty={<EmptyState icon={FiDollarSign} title="No payments yet" />}
            columns={[
              { key: "date", title: "Date", render: (p) => <span className="text-xs">{fmtDay(p.date)}</span> },
              {
                key: "student",
                title: "Student",
                render: (p) => (
                  <div>
                    <p className="font-semibold text-slate-700">{p.student?.name}</p>
                    <p className="text-xs text-slate-400">{p.student?.studentId}</p>
                  </div>
                ),
              },
              { key: "course", title: "Course", className: "hidden md:table-cell", render: (p) => <span className="text-xs text-slate-600">{p.course?.name}</span> },
              { key: "mode", title: "Mode", render: (p) => <span className="text-xs text-slate-600">{PAYMENT_MODE_LABELS[p.mode] || p.mode}{p.reference ? ` · ${p.reference}` : ""}</span> },
              { key: "amount", title: "Amount", align: "right", render: (p) => <span className="font-semibold text-emerald-700">{fmtMoney(p.amount)}</span> },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default Fees;
