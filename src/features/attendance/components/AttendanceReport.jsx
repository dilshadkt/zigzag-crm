import React, { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
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

  return (
    <section className="flex flex-col h-full">
      <div className="w-full h-full flex flex-col overflow-hidden bg-white rounded-3xl">
        <div className="min-h-[48px] relative w-full flex items-center justify-center border-b border-[#E6EBF5]">
          <AttendanceCalendarHeader
            currentDate={currentDate}
            firstDay={startOfMonth(currentDate)}
            onPrevMonth={() => setCurrentDate((date) => subMonths(date, 1))}
            onNextMonth={() => setCurrentDate((date) => addMonths(date, 1))}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
          {!isLoading && days.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F4F9FD] px-3 py-1 text-xs font-semibold text-[#2155A3]">
                Work {formatBreakMinutes(monthWork)}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Break {formatBreakMinutes(monthBreak)}
              </span>
            </div>
          )}

          {isLoading && (
            <p className="py-10 text-center text-sm text-gray-400">Loading report...</p>
          )}

          {!isLoading && days.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">No attendance this month</p>
          )}

          <div className="space-y-3">
            {days.map((day) => (
              <article key={day.key} className="rounded-2xl border border-[#E6EBF5] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {format(new Date(`${day.key}T00:00:00`), "EEE, d MMM yyyy")}
                  </h3>
                  <div className="flex gap-3 text-xs font-semibold tabular-nums">
                    <span className="text-[#2155A3]">Work {formatBreakMinutes(day.work)}</span>
                    <span className="text-amber-700">Break {formatBreakMinutes(day.brk)}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {day.sessions.map((record, index) => (
                    <SessionReport key={record._id || index} record={record} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SessionReport = ({ record }) => {
  const breaks = [...(record.breaks || [])]
    .filter((item) => item?.startTime)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <ol className="space-y-2 border-t border-[#F0F3F8] pt-3">
      <ReportRow label="Check in" time={formatClock(record.clockInTime)} tone="in" />
      {breaks.map((item, index) => {
        const minutes = spanMinutes(item.startTime, item.endTime || new Date());
        return (
          <ReportRow
            key={`${item.startTime}-${index}`}
            label={item.endTime ? "Break" : "Break started"}
            time={
              item.endTime
                ? `${formatClock(item.startTime)} – ${formatClock(item.endTime)}`
                : formatClock(item.startTime)
            }
            note={
              item.endTime
                ? formatBreakMinutes(minutes)
                : `${formatBreakMinutes(minutes)} · in progress`
            }
            tone="break"
          />
        );
      })}
      <ReportRow
        label="Check out"
        time={record.clockOutTime ? formatClock(record.clockOutTime) : "Still in"}
        tone="out"
      />
    </ol>
  );
};

const ReportRow = ({ label, time, note, tone }) => {
  const dot = {
    in: "bg-emerald-500",
    break: "bg-amber-500",
    out: "bg-[#3F8CFF]",
  }[tone];

  return (
    <li className="flex items-center gap-3 text-sm">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="w-24 shrink-0 text-xs font-medium text-gray-400">{label}</span>
      <span className="min-w-0 text-gray-800">{time}</span>
      {note && (
        <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-amber-700">
          {note}
        </span>
      )}
    </li>
  );
};

export default AttendanceReport;
