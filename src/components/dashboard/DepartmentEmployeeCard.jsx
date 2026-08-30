import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DepartmentEmployeeCard = ({ employee, departmentId }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const todayTotal = employee.todayTotal ?? 0;
  const todayCompleted = employee.todayCompleted ?? 0;
  const todayRemaining = Math.max(todayTotal - todayCompleted, 0);
  const todayProgress =
    todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => {
        const params = new URLSearchParams({ employee: employee._id });
        if (departmentId) params.set("department", departmentId);
        navigate(`/department-dashboard/team-tasks?${params.toString()}`);
      }}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 px-4 py-3.5 hover:border-blue-100 hover:bg-[#F8FBFF] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {employee.profile && !imgError ? (
            <img
              src={employee.profile}
              alt={employee.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#3F8CFF] text-white font-bold text-base">
              {employee.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[15px] font-semibold text-gray-800 truncate">
              {employee.name}
            </span>
            {employee.level && (
              <span className="text-[11px] font-medium text-[#7D8592] border border-[#7D8592]/30 rounded px-1.5 py-0.5 shrink-0">
                {employee.level}
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#91929E] truncate mt-0.5">
            {employee.position}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#91929E]">
            Today
          </p>
          <p className="text-[15px] font-bold text-gray-800 mt-0.5">
            {todayTotal} task{todayTotal === 1 ? "" : "s"}
          </p>
          <p className="text-[13px] text-[#3F8CFF] font-semibold mt-0.5">
            {todayCompleted} completed
          </p>
          {todayRemaining > 0 && (
            <p className="text-[12px] text-[#91929E] mt-0.5">
              {todayRemaining} remaining
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[12px] font-medium text-[#91929E]">
            Today&apos;s progress
          </span>
          <span className="text-[12px] font-semibold text-gray-700">
            {todayCompleted} / {todayTotal}
          </span>
        </div>
        <div className="h-2 bg-[#F4F9FD] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3F8CFF] rounded-full transition-all duration-300"
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default DepartmentEmployeeCard;
