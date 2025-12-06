import React from "react";
import Progress from "../progress";
import { IoArrowUpOutline } from "react-icons/io5";
import { BsPlusCircleFill } from "react-icons/bs";
import { useUpdateTaskOrder } from "../../../api/hooks";
import { formatDate } from "../../../lib/dateUtils";

const priorityColors = {
  low: "#00D097", // green
  medium: "#FFBD21", // yellow
  high: "#FF4D4F", // red
};

const getProgressValue = (status) => {
  switch (status?.toLowerCase()) {
    case "todo":
      return 20;
    case "in-progress":
      return 50;
    case "completed":
      return 100;
    default:
      return 0;
  }
};

const Task = ({
  task,
  onClick,
  isBoardView,
  projectId,
  index,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const { mutate: updateOrder } = useUpdateTaskOrder(projectId);
  const priorityColor =
    priorityColors[task?.priority?.toLowerCase()] || priorityColors.medium;
  const progressValue = getProgressValue(task?.status);
  const isExtraTask = task?.taskGroup === "extraTask";

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", task._id);
    onDragStart && onDragStart(e, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver && onDragOver(e, index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData("text/plain");
    if (draggedTaskId !== task._id) {
      updateOrder({ taskId: draggedTaskId, newOrder: index });
    }
    onDrop && onDrop(e, index);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  if (isBoardView) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => handleClick()}
        title={task?.itemType === "subtask" ? "Click to view parent task" : ""}
        className={`p-4 cursor-grab rounded-lg shadow-sm hover:shadow-md 
          transition-shadow relative ${
            task?.itemType === "subtask"
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
              : isExtraTask
              ? "bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500"
              : "bg-white"
          }`}
      >
        {/* Subtask Badge */}
        {task?.itemType === "subtask" && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
            <span className="text-xs">📋</span>
          </div>
        )}

        {/* Extra Task Badge */}
        {isExtraTask && (
          <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1">
            <BsPlusCircleFill className="text-xs" />
          </div>
        )}

        {/* Board Task Badge */}
        {task?.isBoardTask &&
          !task?.project &&
          !isExtraTask &&
          !task?.itemType === "subtask" && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
              <span className="text-xs">🎯</span>
            </div>
          )}

        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h4
                className={`font-medium line-clamp-2 ${
                  task?.itemType === "subtask"
                    ? "text-blue-800"
                    : isExtraTask
                    ? "text-purple-800"
                    : "text-gray-800"
                }`}
              >
                {task?.title}
              </h4>
              {task?.itemType === "subtask" ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-blue-600">📋 Subtask</span>
                  {task?.parentTask && (
                    <span className="text-xs text-blue-500">
                      Parent: {task.parentTask.title}
                    </span>
                  )}
                </div>
              ) : task?.project ? (
                <span className="text-xs text-gray-500">
                  📋 {task.project.name || task.project.displayName}
                </span>
              ) : task?.isBoardTask ? (
                <span className="text-xs text-blue-500">🎯 Board Task</span>
              ) : null}
            </div>
            {isExtraTask && (
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium ml-2">
                Extra
              </span>
            )}
          </div>

          {/* Extra Task Work Type */}
          {isExtraTask && task?.extraTaskWorkType && (
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded capitalize">
              📌 {task.extraTaskWorkType} work
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Multiple assignees display */}
              {task?.assignedTo?.length > 0 ? (
                <div className="flex -space-x-1">
                  {task.assignedTo.slice(0, 3).map((user, index) => (
                    <div
                      key={user._id || index}
                      className="w-6 h-6 overflow-hidden rounded-full border-2 border-white"
                      title={user.firstName}
                    >
                      <img
                        src={user?.profileImage}
                        alt={user?.firstName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {task.assignedTo.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 text-xs flexCenter font-medium text-gray-600">
                      +{task.assignedTo.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flexCenter">
                  <span className="text-xs text-gray-500">?</span>
                </div>
              )}
              <div
                className="flex items-center gap-1"
                style={{ color: priorityColor }}
              >
                <IoArrowUpOutline className="text-sm" />
                <span className="text-xs font-medium">{task?.priority}</span>
              </div>
            </div>
            <Progress size={24} strokeWidth={2} currentValue={progressValue} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => handleClick()}
      title={task?.itemType === "subtask" ? "Click to view parent task" : ""}
      className={`grid gap-y-5 md:gap-y-0 grid-cols-1 md:grid-cols-10 cursor-pointer md:gap-x-3
         px-5 py-5 rounded-3xl relative ${
           task?.itemType === "subtask"
             ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
             : isExtraTask
             ? "bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500"
             : "bg-white"
         }`}
    >
      {/* Subtask Badge for List View */}
      {task?.itemType === "subtask" && (
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
          <span className="text-xs">📋</span>
        </div>
      )}

      {/* Extra Task Badge for List View */}
      {isExtraTask && (
        <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-1">
          <BsPlusCircleFill className="text-xs" />
        </div>
      )}

      {/* Board Task Badge for List View */}
      {task?.isBoardTask &&
        !task?.project &&
        !isExtraTask &&
        !task?.itemType === "subtask" && (
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
            <span className="text-xs">🎯</span>
          </div>
        )}

      <div
        className="col-span-1  border-b pb-6 border-gray-200 md:border-none
      md:pb-0 md:col-span-3 flexBetween"
      >
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#91929E]">Task Name</span>
            {task?.itemType === "subtask" && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Subtask
              </span>
            )}
            {isExtraTask && (
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Extra
              </span>
            )}
            {task?.isBoardTask &&
              !task?.project &&
              !task?.itemType === "subtask" && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  Board
                </span>
              )}
          </div>
          <h4
            className={
              task?.itemType === "subtask"
                ? "text-blue-800 font-medium"
                : isExtraTask
                ? "text-purple-800 font-medium"
                : ""
            }
          >
            {task?.title.slice(0, 35)}
            {task?.title.length > 35 && "..."}
          </h4>
          {/* Project info for tasks/subtasks */}
          {task?.project?.name && (
            <div className="text-xs bg-gray-50 px-3 py-1 rounded-full text-gray-500 mt-1">
              {task.project.name}
            </div>
          )}
        </div>

        <div className="visible md:hidden">
          <Progress size={30} strokeWidth={2} currentValue={progressValue} />
        </div>

        {/* Parent Task Info for Subtasks in List View */}
        {task?.itemType === "subtask" && task?.parentTask && (
          <div className="text-xs text-blue-600 mt-1">
            📋 Parent: {task.parentTask.title}
          </div>
        )}
        {/* Extra Task Work Type in List View */}
        {isExtraTask && task?.extraTaskWorkType && (
          <div className="text-xs text-purple-600 mt-1">
            📌 {task.extraTaskWorkType} work
          </div>
        )}
      </div>
      <div className=" col-span-1  md:col-span-5  grid grid-cols-4">
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Estimate</span>
          <h4>{task?.timeEstimate}h</h4>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Due Date</span>
          <h4 className="text-sm font-medium">{formatDate(task?.dueDate)}</h4>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Assignees</span>
          {task?.assignedTo?.length > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {task.assignedTo.slice(0, 2).map((user, index) => (
                  <div
                    key={user._id || index}
                    className="w-6 h-6 overflow-hidden rounded-full border border-white"
                    title={user.firstName}
                  >
                    <img
                      src={user?.profileImage}
                      alt={user?.firstName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {task.assignedTo.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{task.assignedTo.length - 2}
                </span>
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flexCenter">
              <span className="text-xs text-gray-500">?</span>
            </div>
          )}
        </div>
        <div className="md:flex hidden flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Priority</span>
          <div className="flexStart gap-x-1" style={{ color: priorityColor }}>
            <IoArrowUpOutline className="text-lg " />
            <span className="text-xs font-medium">{task?.priority}</span>
          </div>
        </div>
      </div>
      <div className="  col-span-1 md:col-span-2  flexBetween">
        <div className="flex md:hidden flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Priority</span>
          <div className="flexStart gap-x-1" style={{ color: priorityColor }}>
            <IoArrowUpOutline className="text-lg " />
            <span className="text-xs font-medium">{task?.priority}</span>
          </div>
        </div>
        <span
          className="bg-[#E0F9F2] text-[#00D097] 
flexCenter capitalize text-xs font-medium py-[7px] px-[15px] rounded-lg"
        >
          {task?.status}
        </span>
        <div className="md:flex hidden">
          <Progress size={30} strokeWidth={2} currentValue={progressValue} />
        </div>
      </div>
    </div>
  );
};

export default Task;
