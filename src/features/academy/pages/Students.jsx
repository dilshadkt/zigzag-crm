import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";
import { Card, EmptyState, ErrorState, PageHeader, Pagination, Spinner, StatusBadge, Table, btnPrimary, inputCls, selectCls } from "../../accounts/components/ui";
import { useCourses, useStudents } from "../hooks/useAcademy";
import { useAcademy } from "../context";
import StudentDrawer from "../components/StudentDrawer";
import CredentialsModal from "../components/CredentialsModal";
import { ENROLLMENT_STATUS, SOURCE_LABELS, fmtMoney } from "../utils";

const Students = () => {
  const navigate = useNavigate();
  const { permissions } = useAcademy();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ course: "", batch: "", status: "", active: "" });
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: courseData } = useCourses();
  const courses = courseData?.courses || [];
  const batches = useMemo(
    () => (filters.course ? courses.find((c) => c._id === filters.course)?.batches || [] : courses.flatMap((c) => c.batches.map((b) => ({ ...b, courseName: c.name })))),
    [courses, filters.course]
  );

  const params = { q, ...filters, page, limit: 25 };
  const { data, isLoading, isError, error, refetch, isFetching } = useStudents(params);

  const setFilter = (k) => (e) => {
    setFilters((f) => ({ ...f, [k]: e.target.value, ...(k === "course" ? { batch: "" } : {}) }));
    setPage(1);
  };

  const columns = [
    {
      key: "name",
      title: "Student",
      render: (s) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {s.name}
            {!s.isActive && <span className="ml-2 text-[10px] font-semibold text-slate-400 uppercase">inactive</span>}
          </p>
          <p className="text-xs text-slate-400">
            {s.studentId} · {s.phone || s.email}
          </p>
        </div>
      ),
    },
    {
      key: "course",
      title: "Course / batch",
      render: (s) =>
        s.current ? (
          <div className="min-w-0">
            <p className="text-slate-700 truncate">{s.current.course?.name}</p>
            <p className="text-xs text-slate-400">{s.current.batch?.name || "No batch"}</p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not enrolled</span>
        ),
    },
    {
      key: "status",
      title: "Status",
      render: (s) => (s.current ? <StatusBadge status={s.current.status} map={ENROLLMENT_STATUS} /> : "—"),
    },
    { key: "source", title: "Source", className: "hidden lg:table-cell", render: (s) => <span className="text-xs text-slate-500">{SOURCE_LABELS[s.source] || "—"}</span> },
    {
      key: "balance",
      title: "Fee balance",
      align: "right",
      render: (s) => (
        <div>
          <p className={s.balance > 0 ? "font-semibold text-slate-800" : "text-emerald-600"}>{s.balance > 0 ? fmtMoney(s.balance) : "Paid"}</p>
          {s.overdueAmount > 0 && <p className="text-[11px] text-red-600">{fmtMoney(s.overdueAmount)} overdue</p>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Everyone who joined a course, with their batch, status and fee balance"
        actions={
          permissions.manageStudents && (
            <button className={btnPrimary} onClick={() => setDrawer(true)}>
              <FiPlus /> Add student
            </button>
          )
        }
      />

      <Card padded={false}>
        <div className="flex flex-wrap gap-2 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={`${inputCls} pl-9`} placeholder="Search name, phone, email or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={`${selectCls} !w-auto`} value={filters.course} onChange={setFilter("course")} aria-label="Course">
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className={`${selectCls} !w-auto`} value={filters.batch} onChange={setFilter("batch")} aria-label="Batch">
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.courseName ? `${b.courseName} · ` : ""}
                {b.name}
              </option>
            ))}
          </select>
          <select className={`${selectCls} !w-auto`} value={filters.status} onChange={setFilter("status")} aria-label="Status">
            <option value="">Any status</option>
            {Object.entries(ENROLLMENT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select className={`${selectCls} !w-auto`} value={filters.active} onChange={setFilter("active")} aria-label="Portal access">
            <option value="">Active & inactive</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
            <Table
              columns={columns}
              rows={data?.students || []}
              onRowClick={(s) => navigate(`/academy/students/${s._id}`)}
              empty={
                <EmptyState
                  icon={FiUsers}
                  title={q || Object.values(filters).some(Boolean) ? "No students match" : "No students yet"}
                  text={q || Object.values(filters).some(Boolean) ? "Try other filters." : "Add the students who joined from your ads and walk-ins."}
                />
              }
            />
            <div className="px-4">
              <Pagination page={data?.page} pages={data?.pages} total={data?.total} onPage={setPage} />
            </div>
          </div>
        )}
      </Card>

      <StudentDrawer isOpen={drawer} onClose={() => setDrawer(false)} onCreated={(res) => setCreated(res)} />
      <CredentialsModal
        credentials={created?.credentials}
        student={created?.student}
        onClose={() => {
          const id = created?.student?._id;
          setCreated(null);
          if (id) navigate(`/academy/students/${id}`);
        }}
      />
    </div>
  );
};

export default Students;
