import React, { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { FiCalendar, FiClock, FiCoffee, FiLayers } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { useAttendanceCalendarData } from "../hooks/useAttendanceCalendarData";
import AttendanceCalendarHeader from "./AttendanceCalendarHeader";
import { formatBreakMinutes } from "../utils";

const formatClock = (value) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "h:mm a");
  } catch {
    return "—";
  }
};

const spanMinutes = (start, end) => {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.round(ms / 60000);
};

const isOpenStatus = (status) =>
  status === "checked-in" || status === "break" || status === "overtime";

const breakMinutesFor = (record, now) =>
  (record.breaks || []).reduce((total, item) => {
    if (!item?.startTime) return total;
    return total + spanMinutes(item.startTime, item.endTime || now);
  }, 0);

const workMinutesFor = (record, now) => {
  const end = record.clockOutTime || (isOpenStatus(record.status) ? now : null);
  if (!record.clockInTime || !end) {
    return record.totalHours ? Math.round(Number(record.totalHours) * 60) : 0;
  }
  return Math.max(0, spanMinutes(record.clockInTime, end) - breakMinutesFor(record, now));
};

const StatCard = ({ icon, iconClass, label, value }) => (
  <div className="flex flex-col gap-1 rounded-xl border border-slate-200/60 bg-white p-4">
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${iconClass}`}>
      {icon}
    </div>
    <span className="mt-1 text-xs font-medium tracking-wider text-slate-400">{label}</span>
    <h3 className="text-xl font-bold text-slate-800">{value}</h3>
  </div>
);

const AttendanceReport = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { attendanceData, isLoading } = useAttendanceCalendarData(
    currentDate,
    user?._id || user?.id
  );

  const days = useMemo(() => {
    const grouped = new Map();
    (attendanceData || []).forEach((record) => {
      if (!record?.date && !record?.clockInTime) return;
      const source = record.date || record.clockInTime;
      const key = format(new Date(source), "yyyy-MM-dd");
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(record);
    });

    return [...grouped.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, records]) => {
        const sessions = [...records].sort(
          (a, b) => new Date(a.clockInTime || 0) - new Date(b.clockInTime || 0)
        );
        const work = sessions.reduce((sum, record) => sum + workMinutesFor(record, now), 0);
        const brk = sessions.reduce((sum, record) => sum + breakMinutesFor(record, now), 0);
        return { key, sessions, work, brk };
      });
  }, [attendanceData, now]);

  const monthWork = days.reduce((sum, day) => sum + day.work, 0);
  const monthBreak = days.reduce((sum, day) => sum + day.brk, 0);
  const sessionCount = days.reduce((sum, day) => sum + day.sessions.length, 0);
  const monthLabel = format(startOfMonth(currentDate), "MMMM yyyy");

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-2 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Attendance report</h2>
          <p className="text-xs text-slate-500">
            Work time, breaks, and each check-in for {monthLabel}.
          </p>
        </div>
        <AttendanceCalendarHeader
          currentDate={currentDate}
          firstDay={startOfMonth(currentDate)}
          onPrevMonth={() => setCurrentDate((date) => subMonths(date, 1))}
          onNextMonth={() => setCurrentDate((date) => addMonths(date, 1))}
          isLoading={isLoading}
        />
      </div>

      <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${isLoading ? "opacity-60" : ""}`}>
        <StatCard
          icon={<FiCalendar />}
          iconClass="bg-blue-50 text-blue-600"
          label="Days"
          value={isLoading ? "—" : days.length}
        />
        <StatCard
          icon={<FiClock />}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Work"
          value={isLoading ? "—" : formatBreakMinutes(monthWork)}
        />
        <StatCard
          icon={<FiCoffee />}
          iconClass="bg-amber-50 text-amber-600"
          label="Break"
          value={isLoading ? "—" : formatBreakMinutes(monthBreak)}
        />
        <StatCard
          icon={<FiLayers />}
          iconClass="bg-indigo-50 text-indigo-600"
          label="Shifts"
          value={isLoading ? "—" : sessionCount}
        />
      </div>

      <div className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200/60 bg-slate-50/50 p-3">
          <h4 className="text-sm font-bold text-slate-700">Shift logs</h4>
          <span className="text-xs text-slate-400">
            {isLoading ? "Loading..." : `${days.length} day${days.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {isLoading && (
          <p className="py-10 text-center text-xs font-medium text-slate-400">Loading report...</p>
        )}

        {!isLoading && days.length === 0 && (
          <p className="py-10 text-center text-xs font-medium text-slate-400">
            No attendance this month.
          </p>
        )}

        {!isLoading && days.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3.5 py-2.5 font-bold tracking-wider text-slate-500">Date</th>
                  <th className="px-3.5 py-2.5 font-bold tracking-wider text-slate-500">Check in</th>
                  <th className="px-3.5 py-2.5 font-bold tracking-wider text-slate-500">Breaks</th>
                  <th className="px-3.5 py-2.5 font-bold tracking-wider text-slate-500">Check out</th>
                  <th className="px-3.5 py-2.5 font-bold tracking-wider text-slate-500">Work</th>
                  <th className="px-3.5 py-2.5 font-bold tracking-wider text-slate-500">Break</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {days.map((day) =>
                  day.sessions.map((record, index) => (
                    <tr key={record._id || `${day.key}-${index}`} className="transition-colors hover:bg-slate-50/50">
                      {index === 0 && (
                        <td
                          rowSpan={day.sessions.length}
                          className="border-r border-slate-100 px-3.5 py-3 align-top font-bold text-slate-800"
                        >
                          <div>{format(new Date(`${day.key}T00:00:00`), "EEE, d MMM")}</div>
                          <div className="mt-1 font-medium text-slate-400">
                            {formatBreakMinutes(day.work)} · {formatBreakMinutes(day.brk)} break
                          </div>
                        </td>
                      )}
                      <SessionCells record={record} now={now} />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SessionCells = ({ record, now }) => {
  const breaks = [...(record.breaks || [])]
    .filter((item) => item?.startTime)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const open = isOpenStatus(record.status) && !record.clockOutTime;

  return (
    <>
      <td className="px-3.5 py-3 font-medium text-slate-800">{formatClock(record.clockInTime)}</td>
      <td className="px-3.5 py-3 text-slate-600">
        {breaks.length === 0 && <span className="text-slate-400">—</span>}
        {breaks.length > 0 && (
          <div className="flex flex-col gap-1">
            {breaks.map((item, index) => {
              const minutes = spanMinutes(item.startTime, item.endTime || now);
              return (
                <span key={`${item.startTime}-${index}`}>
                  {item.endTime
                    ? `${formatClock(item.startTime)} – ${formatClock(item.endTime)}`
                    : `${formatClock(item.startTime)} · in progress`}
                  <span className="ml-1 font-semibold text-amber-600">{formatBreakMinutes(minutes)}</span>
                </span>
              );
            })}
          </div>
        )}
      </td>
      <td className="px-3.5 py-3">
        {open ? (
          <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
            Still in
          </span>
        ) : (
          <span className="text-slate-600">{formatClock(record.clockOutTime)}</span>
        )}
      </td>
      <td className="px-3.5 py-3 font-bold text-slate-800">
        {formatBreakMinutes(workMinutesFor(record, now))}
      </td>
      <td className="px-3.5 py-3 text-slate-600">
        {formatBreakMinutes(breakMinutesFor(record, now))}
      </td>
    </>
  );
};

export default AttendanceReport;
