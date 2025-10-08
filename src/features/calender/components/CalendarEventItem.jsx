import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGift } from "react-icons/fa";
import {
  getProjectStyle,
  getTaskStyle,
  getBirthdayStyle,
  getSubtaskStyle,
  getExtraTaskStyle,
} from "../../../utils/calendarStyles";
import { truncateText } from "../../../utils/textUtils";

const CalendarEventItem = ({ type, data, showExtraDetails = false }) => {
  const navigate = useNavigate();

  // Handle task navigation based on parent task logic
  const handleTaskNavigation = (task) => {
    let projectId;
    let taskId;

    if (task.parentTask) {
      projectId = task.project._id;
      taskId = task.parentTask._id;
    } else {
      projectId = task.project?._id;
      taskId = task._id;
    }

    // Handle navigation for extra tasks (tasks without project)
    if (projectId) {
      navigate(`/projects/${projectId}/${taskId}`);
    } else {
      // For extra tasks without project, navigate to task details directly
      navigate(`/tasks/${taskId}`);
    }
  };

  switch (type) {
    case "project":
      return <ProjectItem project={data} navigate={navigate} />;
    case "task":
      return (
        <TaskItem
          task={data}
          onNavigate={handleTaskNavigation}
          showExtraDetails={showExtraDetails}
        />
      );
    case "subtask":
      return (
        <SubtaskItem
          subtask={data}
          onNavigate={handleTaskNavigation}
          showExtraDetails={showExtraDetails}
        />
      );
    case "birthday":
      return <BirthdayItem employee={data} />;
    default:
      return null;
  }
};

const ProjectItem = ({ project, navigate }) => {
  const colorStyle = getProjectStyle(project.priority);
  const progress = project.progress || 0;
  const hasThumb = project.thumbImg && project.thumbImg.trim() !== "";

  return (
    <div
      onClick={() => {
        navigate(`/projects-analytics/${project?._id}`);
      }}
      className={`text-xs ${hasThumb ? "" : colorStyle.bg} ${colorStyle.text} ${
        colorStyle.border
      } border 
      rounded-md cursor-pointer hover:shadow-sm transition-all 
      duration-200 relative overflow-hidden`}
      title={`${project.name} (${
        project.priority || "medium"
      } priority) - ${progress}% complete`}
    >
      {/* Progress bar in background */}
      <div
        className={`absolute left-0 top-0 bottom-0 ${colorStyle.progress} opacity-30`}
        style={{ width: `${progress}%` }}
      ></div>

      {/* Content on top of progress bar */}
      {hasThumb ? (
        <div className="flex items-center relative z-10">
          <div className="w-6 h-6 flex-shrink-0">
            <img
              src={project.thumbImg}
              alt={project.name}
              className="w-full h-full rounded-l-md object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icons/project-default.svg";
              }}
            />
          </div>
          <div className="flex-1 px-1.5 py-1 flex items-center justify-between">
            <span className="truncate">{truncateText(project.name)}</span>
            <span className="text-xs font-semibold ml-1">{progress}%</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 relative z-10 px-2 py-1.5">
          <span
            className={`h-2 w-2 rounded-full ${colorStyle.dot} flex-shrink-0`}
          ></span>
          <span className="truncate">{truncateText(project.name)}</span>
          <span className="text-xs font-semibold ml-auto">{progress}%</span>
        </div>
      )}
    </div>
  );
};

const TaskItem = ({ task, onNavigate, showExtraDetails }) => {
  const colorStyle = getTaskStyle(task);
  const isExtraTask = !task.project;
  const isCarriedTask = task.isCarriedTask; // Task shown on today from another date
  const isBeingCarried = task.isBeingCarriedToToday; // Task on original date that's also shown today
  const statusText =
    {
      todo: "To Do",
      "in-progress": "In Progress",
      completed: "Done",
      "on-review": "On Review",
      "on-hold": "On Hold",
      "re-work": "Re-work",
      approved: "Approved",
      "client-approved": "Client Approved",
    }[task.status] || "To Do";

  // Format original date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      onClick={() => onNavigate(task)}
      className={`text-xs ${
        isCarriedTask
          ? "bg-orange-50 text-orange-900 border-orange-400"
          : isBeingCarried
          ? "bg-blue-50 text-blue-900 border-blue-400"
          : `${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`
      } border-2
      rounded-md px-2 py-1.5 cursor-pointer hover:shadow-sm transition-all 
      duration-200 relative overflow-hidden ${
        isExtraTask ? "border-dashed" : ""
      } ${isCarriedTask ? "border-l-4" : ""} ${
        isBeingCarried ? "border-dashed border-2" : ""
      }`}
      title={`${isExtraTask ? "Extra Task" : "Task"}: ${task.title} (${
        task.priority || "medium"
      } priority) - Status: ${statusText}${
        task.project ? ` - Project: ${task.project.name}` : " - No Project"
      }${
        isCarriedTask
          ? ` - Carried from ${formatDate(task.originalDueDate)}`
          : ""
      }${
        isBeingCarried
          ? ` - Also showing on ${formatDate(task.carriedToDate)}`
          : ""
      }`}
    >
      <div className="flex flex-col gap-1 relative z-10">
        {/* Carried Task Badge */}
        {isCarriedTask && (
          <div className="flex items-center gap-1">
            <span
              className={`${
                showExtraDetails
                  ? "text-[10px] px-2 py-1"
                  : "text-[9px] px-1.5 py-0.5"
              } bg-orange-500 text-white rounded-full font-semibold flex items-center gap-1 shadow-sm`}
            >
              <span>📌</span>
              <span>Carried from {formatDate(task.originalDueDate)}</span>
            </span>
          </div>
        )}

        {/* Being Carried Badge */}
        {isBeingCarried && (
          <div className="flex items-center gap-1">
            <span
              className={`${
                showExtraDetails
                  ? "text-[10px] px-2 py-1"
                  : "text-[9px] px-1.5 py-0.5"
              } bg-blue-500 text-white rounded-full font-semibold flex items-center gap-1 shadow-sm`}
            >
              <span>⚡</span>
              <span>Also on {formatDate(task.carriedToDate)}</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-1.5">
          <div className="flexStart gap-x-1">
            {!showExtraDetails ? (
              <span
                className={`h-[6px] w-[6px] rounded-full ${
                  isCarriedTask
                    ? "bg-orange-500"
                    : isBeingCarried
                    ? "bg-blue-500"
                    : colorStyle.dot
                } flex-shrink-0`}
              ></span>
            ) : (
              <span
                className={`h-8 w-8 uppercase ${
                  isCarriedTask
                    ? "bg-orange-500 ring-2 ring-orange-300"
                    : isBeingCarried
                    ? "bg-blue-500 ring-2 ring-blue-300"
                    : "bg-gray-600"
                }
            text-white font-bold rounded-full flexCenter`}
              >
                {task?.project?.thumbImg ? (
                  <img
                    src={task?.project?.thumbImg}
                    alt=""
                    className="rounded-full"
                  />
                ) : (
                  task?.project?.name?.slice(0, 1)
                )}
              </span>
            )}

            <div className="flex flex-col gap-y-1">
              <div className="flex gap-x-2">
                <span
                  className={`truncate flex-1 ${
                    showExtraDetails && `uppercase`
                  } `}
                >
                  {truncateText(task.title, 8)}
                </span>
                {showExtraDetails && task?.parentTask && (
                  <span className="text-[10px] text-gray-500 font-medium capitalize bg-gray-200 px-1 rounded-sm flexCenter">
                    {task?.parentTask?.taskGroup}
                  </span>
                )}
              </div>
              {showExtraDetails && (
                <span className="truncate text-gray-400 text-xs flex-1">
                  {isExtraTask
                    ? "No Project"
                    : truncateText(task?.project?.name)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col  items-end">
            <span className="text-[10px] italic opacity-75 ml-auto">
              {statusText}
            </span>
            {showExtraDetails && (
              <div className="flex gap-x-0.5">
                {task?.assignedTo?.map((assignee, index) => (
                  <span
                    title={assignee?.name}
                    key={index}
                    className="w-4 h-4 bg-gray-600 flexCenter text-[10px] uppercase
                     text-white font-semibold rounded-full"
                  >
                    {assignee?.avatar === "/api/placeholder/32/32" ? (
                      assignee?.name?.slice(0, 1)
                    ) : (
                      <img src={assignee?.avatar} alt="" />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubtaskItem = ({ subtask, onNavigate, showExtraDetails }) => {
  const colorStyle = getSubtaskStyle(subtask);
  const isExtraSubtask = !subtask.project;
  const isCarriedTask = subtask.isCarriedTask; // Subtask shown on today from another date
  const isBeingCarried = subtask.isBeingCarriedToToday; // Subtask on original date that's also shown today
  const statusText =
    {
      todo: "To Do",
      "in-progress": "In Progress",
      completed: "Done",
      "on-review": "On Review",
      "on-hold": "On Hold",
      "re-work": "Re-work",
      approved: "Approved",
      "client-approved": "Client Approved",
    }[subtask.status] || "To Do";

  // Format original date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      onClick={() => onNavigate(subtask)}
      className={`text-xs ${
        isCarriedTask
          ? "bg-orange-50 text-orange-900 border-orange-400"
          : isBeingCarried
          ? "bg-blue-50 text-blue-900 border-blue-400"
          : `${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`
      } border-2
      rounded-md px-2 py-1.5 cursor-pointer hover:shadow-sm transition-all 
      duration-200 relative overflow-hidden ${
        isExtraSubtask ? "border-dashed" : ""
      } ${isCarriedTask ? "border-l-4" : ""} ${
        isBeingCarried ? "border-dashed border-2" : ""
      }`}
      title={`${isExtraSubtask ? "Extra Subtask" : "Subtask"}: ${
        subtask.title
      } - Status: ${statusText} - Parent: ${subtask.parentTask?.title}${
        subtask.project
          ? ` - Project: ${subtask.project.name}`
          : " - No Project"
      }${
        isCarriedTask
          ? ` - Carried from ${formatDate(subtask.originalDueDate)}`
          : ""
      }${
        isBeingCarried
          ? ` - Also showing on ${formatDate(subtask.carriedToDate)}`
          : ""
      }`}
    >
      <div className="flex flex-col gap-1 relative z-10">
        {/* Carried Subtask Badge */}
        {isCarriedTask && (
          <div className="flex items-center gap-1">
            <span
              className={`${
                showExtraDetails
                  ? "text-[10px] px-2 py-1"
                  : "text-[9px] px-1.5 py-0.5"
              } bg-orange-500 text-white rounded-full font-semibold flex items-center gap-1 shadow-sm`}
            >
              <span>📌</span>
              <span>Carried from {formatDate(subtask.originalDueDate)}</span>
            </span>
          </div>
        )}

        {/* Being Carried Badge */}
        {isBeingCarried && (
          <div className="flex items-center gap-1">
            <span
              className={`${
                showExtraDetails
                  ? "text-[10px] px-2 py-1"
                  : "text-[9px] px-1.5 py-0.5"
              } bg-blue-500 text-white rounded-full font-semibold flex items-center gap-1 shadow-sm`}
            >
              <span>⚡</span>
              <span>Also on {formatDate(subtask.carriedToDate)}</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-1.5">
          <div className="flexStart gap-x-1">
            {!showExtraDetails ? (
              <div className="flex items-center gap-1">
                {/* <MdSubdirectoryArrowRight className="text-green-600 text-sm" /> */}
                <span
                  className={`h-[6px] w-[6px] rounded-full ${
                    isCarriedTask
                      ? "bg-orange-500"
                      : isBeingCarried
                      ? "bg-blue-500"
                      : colorStyle.dot
                  } flex-shrink-0`}
                ></span>
              </div>
            ) : (
              <span
                className={`h-8 w-8 uppercase ${
                  isCarriedTask
                    ? "bg-orange-500 ring-2 ring-orange-300"
                    : isBeingCarried
                    ? "bg-blue-500 ring-2 ring-blue-300"
                    : "bg-green-600"
                }
            text-white font-bold rounded-full flexCenter`}
              >
                {subtask?.project?.thumbImg ? (
                  <img
                    src={subtask?.project?.thumbImg}
                    alt=""
                    className="rounded-full"
                  />
                ) : (
                  subtask.project.name.slice(0, 1)
                )}
              </span>
            )}

            <div className="flex flex-col gap-y-1">
              <div className="flex gap-x-2">
                <span
                  className={`truncate flex-1 ${
                    showExtraDetails && `uppercase`
                  } `}
                >
                  {truncateText(subtask.title, 10)}
                </span>
                {showExtraDetails && (
                  <span className="text-[10px] text-green-600 font-medium capitalize bg-green-100 px-1 rounded-sm flexCenter">
                    Subtask
                  </span>
                )}
                {isExtraSubtask && (
                  <span className="text-[10px] text-indigo-600 font-medium capitalize bg-indigo-100 px-1 rounded-sm flexCenter">
                    Extra
                  </span>
                )}
              </div>
              {showExtraDetails && (
                <div className="flex flex-col gap-y-0.5">
                  <span className="truncate text-gray-400 text-xs flex-1">
                    {isExtraSubtask
                      ? "No Project"
                      : truncateText(subtask?.project?.name)}
                  </span>
                  <span className="truncate text-green-600 text-xs flex-1">
                    Parent: {truncateText(subtask?.parentTask?.title)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] italic opacity-75 ml-auto">
              {statusText}
            </span>
            {showExtraDetails && (
              <div className="flex gap-x-0.5">
                {subtask?.assignedTo?.map((assignee, index) => (
                  <span
                    title={assignee?.name}
                    key={index}
                    className="w-4 h-4 bg-green-600 flexCenter text-[10px] uppercase
                     text-white font-semibold rounded-full"
                  >
                    {assignee?.avatar === "/api/placeholder/32/32" ? (
                      assignee?.name?.slice(0, 1)
                    ) : (
                      <img src={assignee?.avatar} alt="" />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BirthdayItem = ({ employee }) => {
  // Get first letter of name for avatar fallback
  const firstLetter = employee.firstName
    ? employee.firstName.charAt(0).toUpperCase()
    : "U";

  return (
    <div
      className={`text-xs ${getBirthdayStyle().bg} ${getBirthdayStyle().text} ${
        getBirthdayStyle().border
      } border 
      rounded-md cursor-pointer hover:shadow-sm transition-all 
      duration-200 relative overflow-hidden `}
      title={`Happy ${employee.age}th Birthday to ${employee.firstName} ${
        employee.lastName || ""
      }!`}
    >
      <div className="flex items-center gap-1.5 p-1.5 relative z-10">
        <div className="flex-shrink-0 relative">
          {employee.profileImage ? (
            <img
              src={employee.profileImage}
              alt={`${employee.firstName}'s birthday`}
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12" font-family="Arial" fill="white">${firstLetter}</text></svg>`;
              }}
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
              {firstLetter}
            </div>
          )}
          <FaGift className="absolute -bottom-1 -right-1 text-[10px] text-purple-500" />
        </div>
        <span className="truncate flex-1">
          {truncateText(`${employee.firstName}'s Birthday!`)}
        </span>
      </div>
    </div>
  );
};

export default CalendarEventItem;
