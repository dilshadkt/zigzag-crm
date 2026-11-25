import React from "react";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "../studentClient";
import { usePortal } from "../portalContext";
import { PageTitle, Panel, Ring } from "../ui";
import { ATTENDANCE_STATUS, fmtDay } from "../../utils";

const weekday = (day) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });

const Attendance = () => {
  const { enrollment } = usePortal();
  const { data, isLoading } = useQuery({ queryKey: ["student-portal", "attendance"], queryFn: studentApi.attendance });
  const batches = data?.batches || [];
  const current = batches.find((b) => b.batch._id === enrollment?.batch?._id) || batches[0];
  const low = current && current.summary.percent !== null && current.summary.percent < 75;

  return (
    <div>
      <PageTitle title="Attendance" subtitle="Late counts as attended. Excused days are not counted." />
      {isLoading ? (
        <Panel>
          <p className="text-sm text-[#91929E]">Loading…</p>
        </Panel>
      ) : !current ? (
        <Panel>
          <p className="text-sm text-[#7D8592] text-center py-6">No classes marked yet.</p>
        </Panel>
      ) : (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 items-start">
          <Panel title="Summary">
            <div className="flex flex-col items-center">
              <Ring value={current.summary.percent} size={132} color={low ? "#EF4444" : "#10B981"} label="Attendance" />
              <p className="text-xs text-[#91929E] mt-2">Overall attendance</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {["present", "late", "absent", "excused"].map((s) => (
                <div key={s} className={`rounded-2xl px-4 py-3 ${ATTENDANCE_STATUS[s].soft}`}>
                  <p className="text-2xl font-bold tabular-nums">{current.summary[s]}</p>
                  <p className="text-xs font-semibold">{ATTENDANCE_STATUS[s].label}</p>
                </div>
              ))}
            </div>
            {low && <p className="mt-4 text-sm text-red-600">Your attendance is below 75%. Please attend classes regularly.</p>}
          </Panel>

          <Panel title="Class history" subtitle={`${current.batch.course?.name} · ${current.batch.name}`} bodyClassName="!px-0 !pb-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[#91929E] border-b border-[#EEF3F9]">
                    <th className="px-5 md:px-6 py-2.5 font-semibold">Date</th>
                    <th className="px-3 py-2.5 font-semibold">Topic</th>
                    <th className="px-5 md:px-6 py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {current.days.map((d) => (
                    <tr key={d.day} className="border-b border-[#F4F7FB] last:border-0">
                      <td className="px-5 md:px-6 py-3 whitespace-nowrap">
                        <p className="font-bold text-[#0A1629]">{fmtDay(d.day)}</p>
                        <p className="text-xs text-[#91929E]">{weekday(d.day)}</p>
                      </td>
                      <td className="px-3 py-3 text-[#7D8592]">{d.topic || "—"}</td>
                      <td className="px-5 md:px-6 py-3 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${ATTENDANCE_STATUS[d.status]?.soft}`}>
                          {ATTENDANCE_STATUS[d.status]?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};

export default Attendance;
