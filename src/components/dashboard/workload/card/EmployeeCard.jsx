import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Progress from "../../../shared/progress";
import OverloadRescheduleDrawer from "../OverloadRescheduleDrawer";

const EmployeeCard = ({ employee, index, positions }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [showRescheduleDrawer, setShowRescheduleDrawer] = useState(false);

  const handleClick = () => {
    navigate(`/employees/${employee._id}`);
  };

  const progressValue =
    typeof employee?.today_progress_value === "number"
      ? employee.today_progress_value
      : employee?.todayProgressValue || 0;

  const todayTasks = 
    typeof employee?.today_task_count === "number"
      ? employee.today_task_count
      : employee?.todayTaskCount || 0;

  // The daily checklist counts as one task for display, but overload (and the
  // reschedule drawer behind it) only measures work that can be moved.
  const checklistToday = employee?.today_checklist_count || 0;
  const displayedTodayTasks = todayTasks + checklistToday;

  const positionObj = positions?.find(p => p.name === employee.position);
  const dailyLimit = positionObj?.dailyTaskLimit || 10;
  const isOverloaded = todayTasks > dailyLimit;
  
  let bgColorClass = "bg-[#F4F9FD]"; // Default
  if (todayTasks > dailyLimit) {
    bgColorClass = "bg-red-50";
  } else if (todayTasks > (dailyLimit / 2)) {
    bgColorClass = "bg-[#F4F9FD]";
  }

  const employeeName =
    employee.name ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Unnamed";

  const profileImage =
    employee?.profileImage ||
    employee?.profile ||
    `/image/dummy/avatar1.svg`;

  const firstLetter = employeeName.charAt(0).toUpperCase();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleOverloadBadgeClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    setShowRescheduleDrawer(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        key={employee._id || index}
        className={`flex flex-col items-center rounded-[20px] ${bgColorClass} p-3 md:p-4 py-4 
               h-full cursor-pointer min-w-0 relative transition-all duration-200 justify-between ${
                 isOverloaded 
                   ? "border border-red-300" 
                   : "border border-transparent hover:border-[#D8E0F0]"
               }`}
      >
        {isOverloaded && (
          <div
            onClick={handleOverloadBadgeClick}
            className="absolute -top-2 -right-2 md:-right-1 bg-red-500 text-white text-[10px] font-bold 
              px-2 py-1 rounded-full shadow-md z-10 flex items-center gap-1 animate-pulse
              hover:bg-red-600 hover:scale-110 transition-all duration-200 cursor-pointer"
            title={`${todayTasks} tasks today — Click to reschedule`}
          >
            <span className="animate-bounce inline-block">⚠️</span> {todayTasks}
          </div>
        )}
        <div className="relative">
          <Progress
            size={69}
            strokeWidth={2}
            currentValue={progressValue}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full rounded-full scale-85 flexCenter overflow-hidden">
            {!imageError && profileImage !== `/image/dummy/avatar1.svg` ? (
              <img
                src={profileImage}
                alt=""
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flexCenter text-gray-800 font-semibold text-xl">
                {firstLetter}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-y-1 mt-2 w-full min-w-0">
          <h4 className="font-medium text-center text-sm capitalize line-clamp-2 w-full px-1 leading-tight">
            {employeeName}
          </h4>
          <span className="text-xs md:text-sm text-gray-500 line-clamp-2 w-full text-center px-1 leading-tight">
            {employee.position || "—"}
          </span>
          <div className="text-[#7D8592] bg-white/70 text-[11px] font-medium rounded-full px-2.5 py-0.5 mt-2">
            {employee.level || "Middle"}
          </div>
          <div className="mt-2 flex items-center justify-center text-xs font-semibold bg-white/60 px-2 py-1 rounded-md w-full">
            <span className={`${todayTasks > dailyLimit ? 'text-red-600' : todayTasks > (dailyLimit / 2) ? 'text-orange-600' : 'text-blue-600'}`}>
              {displayedTodayTasks} {displayedTodayTasks === 1 ? 'Task' : 'Tasks'} Today
            </span>
          </div>
        </div>
      </div>

      {/* Reschedule Drawer */}
      <OverloadRescheduleDrawer
        isOpen={showRescheduleDrawer}
        onClose={() => setShowRescheduleDrawer(false)}
        employee={employee}
        dailyLimit={dailyLimit}
      />
    </>
  );
};

export default EmployeeCard;
