import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentToken, setStudentToken, studentApi } from "./studentClient";
import { PortalContext } from "./portalContext";
import useLightTheme from "../useLightTheme";
import { PortalDrawer, PortalSidebar } from "./layout/PortalSidebar";
import PortalHeader from "./layout/PortalHeader";
import ChangePassword from "./ChangePassword";
import Home from "./pages/Home";
import Course from "./pages/Course";
import Tasks from "./pages/Tasks";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Certificate from "./pages/Certificate";
import Profile from "./pages/Profile";

const SIDEBAR_KEY = "student-sidebar-expanded";

// Labels help first-time users, so the sidebar starts open
const readExpanded = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) !== "0";
  } catch {
    return true;
  }
};

const StudentPortal = () => {
  useLightTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const hasToken = Boolean(getStudentToken());
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-portal", "me"],
    queryFn: studentApi.me,
    enabled: hasToken,
    retry: false,
  });
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(readExpanded);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = data?.academy?.name ? `${data.academy.name} · Student portal` : "Student portal";
  }, [data?.academy?.name]);

  const enrollments = useMemo(() => data?.enrollments || [], [data]);
  const wanted = selected || data?.current;
  const enrollment = useMemo(
    () => enrollments.find((e) => e._id === wanted) || enrollments[0] || null,
    [enrollments, wanted]
  );

  if (!hasToken) return <Navigate to="/student/login" replace />;
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F4F9FD] flex items-center justify-center text-[#7D8592] text-sm gap-2">
        <span className="w-4 h-4 border-2 border-slate-200 border-t-[#3F8CFF] rounded-full animate-spin" /> Loading…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="min-h-dvh bg-[#F4F9FD] flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-[#0A1629]">{error?.message || "Could not load your portal."}</p>
        <button className="h-10 px-4 rounded-xl bg-[#3F8CFF] text-white text-sm font-semibold" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  const logout = () => {
    setStudentToken(null);
    queryClient.removeQueries({ queryKey: ["student-portal"] });
    navigate("/student/login", { replace: true });
  };

  if (data.student.mustChangePassword) {
    return <ChangePassword firstTime student={data.student} onDone={() => refetch()} onLogout={logout} />;
  }

  const toggleSidebar = () =>
    setExpanded((open) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, open ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !open;
    });

  const badges = { "/student/tasks": enrollment?.tasks?.pending || 0 };
  const value = { ...data, enrollment, logout, refetch };

  return (
    <PortalContext.Provider value={value}>
      <main className="bg-[#F4F9FD] h-dvh overflow-hidden flex">
        <PortalSidebar expanded={expanded} onToggle={toggleSidebar} onLogout={logout} badges={badges} />
        <section className="flex-1 min-w-0 h-full flex flex-col gap-3 p-2 md:p-3">
          <PortalHeader
            student={data.student}
            enrollments={enrollments}
            enrollment={enrollment}
            onSelect={setSelected}
            onMenu={() => setMenuOpen(true)}
          />
          {/* keyed by path so each page opens scrolled to the top */}
          <div key={pathname} className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1 pb-2 scrollbar-hover">
            <Routes>
              <Route index element={<Home />} />
              <Route path="course" element={<Course />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="certificate" element={<Certificate />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/student" replace />} />
            </Routes>
          </div>
        </section>
        <PortalDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={logout} badges={badges} />
      </main>
    </PortalContext.Provider>
  );
};

export default StudentPortal;
