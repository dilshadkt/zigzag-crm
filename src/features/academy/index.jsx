import React, { useMemo } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AcademyContext } from "./context";
import { useAcademyMeta } from "./hooks/useAcademy";
import { ErrorState, Spinner } from "../accounts/components/ui";
import Overview from "./pages/Overview";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Courses from "./pages/Courses";
import Tasks from "./pages/Tasks";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Certificates from "./pages/Certificates";

const Academy = () => {
  const { data, isLoading, isError, error, refetch } = useAcademyMeta();
  const { pathname } = useLocation();

  const value = useMemo(() => ({ permissions: data?.permissions || {}, meta: data || null }), [data]);

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return (
      <section className="rounded-2xl bg-white h-full">
        <ErrorState error={error?.message ? error : "You do not have access to the academy module."} onRetry={refetch} />
      </section>
    );
  }

  const p = value.permissions;
  const tabs = [
    { to: "/academy", label: "Overview", end: true, show: p.view },
    { to: "/academy/students", label: "Students", show: p.view },
    { to: "/academy/courses", label: "Courses & Batches", show: true },
    { to: "/academy/attendance", label: "Attendance", show: p.markAttendance || p.view },
    { to: "/academy/tasks", label: "Tasks", show: p.manageTasks || p.view },
    { to: "/academy/fees", label: "Fees", show: p.manageFees || p.view },
    { to: "/academy/certificates", label: "Certificates", show: p.issueCertificates || p.view },
  ].filter((t) => t.show);
  const home = tabs[0]?.to || "/academy/courses";

  return (
    <AcademyContext.Provider value={value}>
      <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white">
        <header className="px-4 md:px-6 pt-4 border-b border-slate-100 shrink-0">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h1 className="text-base md:text-lg font-bold text-slate-800">Academy</h1>
            <a href="/student/login" target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#3F8CFF] hover:underline">
              Student portal ↗
            </a>
          </div>
          <nav className="flex gap-1 overflow-x-auto hide-scrollbar -mb-px" aria-label="Academy sections">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    isActive ? "border-[#3F8CFF] text-[#3F8CFF]" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFCFE]" key={pathname.split("/")[2] || "home"}>
          <Routes>
            <Route index element={p.view ? <Overview /> : <Navigate to={home} replace />} />
            {p.view && <Route path="students" element={<Students />} />}
            {p.view && <Route path="students/:id" element={<StudentDetail />} />}
            <Route path="courses" element={<Courses />} />
            {(p.markAttendance || p.view) && <Route path="attendance" element={<Attendance />} />}
            {(p.manageTasks || p.view) && <Route path="tasks" element={<Tasks />} />}
            {(p.manageFees || p.view) && <Route path="fees" element={<Fees />} />}
            {(p.issueCertificates || p.view) && <Route path="certificates" element={<Certificates />} />}
            <Route path="*" element={<Navigate to={home} replace />} />
          </Routes>
        </div>
      </section>
    </AcademyContext.Provider>
  );
};

export default Academy;
