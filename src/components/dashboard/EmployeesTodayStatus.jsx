import React from "react";
import { useEmployeesTodayStatus } from "../../api/hooks/dashboard";
import { FaUserCircle, FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa";

const EmployeesTodayStatus = () => {
  const { data, isLoading } = useEmployeesTodayStatus();
  const employees = data?.data || [];

  const workingEmployees = employees.filter(emp => emp.pendingCount > 0);
  const finishedEmployees = employees.filter(emp => emp.pendingCount === 0 && emp.completedCount > 0);
  const inactiveEmployees = employees.filter(emp => emp.pendingCount === 0 && emp.completedCount === 0);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-[550px]">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Team Daily Status
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">Finished vs still working</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Working / Pending Column */}
        <div className="flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Working ({workingEmployees.length})
            </h4>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <LoadingPulse count={2} />
            ) : workingEmployees.length === 0 ? (
              <EmptyState message="All done!" icon={<FaCheckCircle className="text-emerald-400 text-lg" />} />
            ) : (
              workingEmployees.map(emp => (
                <EmployeeCard key={emp._id} emp={emp} status="working" />
              ))
            )}
          </div>
        </div>

        {/* Finished / Completed Column */}
        <div className="flex flex-col bg-emerald-50 rounded-2xl p-4 border border-emerald-100 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-emerald-700 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              Done ({finishedEmployees.length})
            </h4>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-emerald-200">
            {isLoading ? (
              <LoadingPulse count={2} />
            ) : finishedEmployees.length === 0 ? (
              <EmptyState message="None yet" icon={<FaClock className="text-slate-300 text-lg" />} />
            ) : (
              finishedEmployees.map(emp => (
                <EmployeeCard key={emp._id} emp={emp} status="finished" />
              ))
            )}
          </div>
        </div>
      </div>

      {inactiveEmployees.length > 0 && (
        <div className="mt-4 px-4 flex items-center gap-2 text-[11px] text-gray-400">
          <FaExclamationCircle />
          <span>{inactiveEmployees.length} employees have no tasks assigned for today</span>
        </div>
      )}
    </div>
  );
};

const EmployeeCard = ({ emp, status }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-blue-200 transition-all hover:shadow-md group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar user={emp} size="w-11 h-11" />
        <div>
          <h5 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
            {emp.firstName} {emp.lastName}
          </h5>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <FaCheckCircle className="text-[10px]" /> {emp.completedCount} Done
            </span>
            <span className={`flex items-center gap-1 text-[11px] font-bold ${emp.pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              <FaClock className="text-[10px]" /> {emp.pendingCount} Left
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        {status === 'finished' ? (
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
            100% DONE
          </span>
        ) : (
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (emp.completedCount / (emp.completedCount + emp.pendingCount)) * 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const LoadingPulse = ({ count }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-20 bg-white rounded-2xl animate-pulse"></div>
    ))}
  </div>
);

const EmptyState = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="text-3xl mb-2 opacity-30">{icon}</div>
    <p className="text-xs text-gray-400 font-medium px-4">{message}</p>
  </div>
);

const Avatar = ({ user, size = "w-10 h-10" }) => {
  const userName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "U";
  const firstLetter = userName.charAt(0).toUpperCase();

  return user?.profileImage ? (
    <img src={user.profileImage} alt={userName} className={`${size} rounded-full object-cover border-2 border-white shadow-sm`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-sm`}>
      {firstLetter}
    </div>
  );
};

export default EmployeesTodayStatus;
