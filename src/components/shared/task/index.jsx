import React from "react";
import Progress from "../progress";
import { IoArrowUpOutline } from "react-icons/io5";
import { useUpdateTaskOrder } from "../../../api/hooks";

const priorityColors = {
  low: "#00D097", // green
  medium: "#FFBD21", // yellow
  high: "#FF4D4F", // red
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
        className="bg-white p-4 cursor-grab rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col gap-3">
          <h4 className="font-medium text-gray-800 line-clamp-2">
            {task?.title}
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 overflow-hidden rounded-full">
                <img
                  src={task?.assignedTo?.profileImage}
                  alt={task?.assignedTo?.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="flex items-center gap-1"
                style={{ color: priorityColor }}
              >
                <IoArrowUpOutline className="text-sm" />
                <span className="text-xs font-medium">{task?.priority}</span>
              </div>
            </div>
            <Progress size={24} strokeWidth={2} currentValue={100} />
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
      className="grid grid-cols-10 cursor-pointer gap-x-3 px-5 bg-white py-5 rounded-3xl"
    >
      <div className="col-span-3 gap-y-1 flex flex-col">
        <span className="text-sm text-[#91929E]">Task Name</span>
        <h4>{task?.title}</h4>
      </div>
      <div className="col-span-5  grid grid-cols-4">
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Estimate</span>
          <h4>{task?.timeEstimate}h</h4>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Spent Time</span>
          <h4>1d 2h</h4>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Assignee</span>

          <div className="w-6 h-6 overflow-hidden rounded-full  flexCenter">
            <img
              src={task?.assignedTo?.profileImage}
              alt={task?.assignedTo?.firstName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Priority</span>
          <div className="flexStart gap-x-1" style={{ color: priorityColor }}>
            <IoArrowUpOutline className="text-lg " />
            <span className="text-xs font-medium">{task?.priority}</span>
          </div>
        </div>
      </div>
      <div className="col-span-2  flexBetween">
        <span
          className="bg-[#E0F9F2] text-[#00D097] 
flexCenter capitalize text-xs font-medium py-[7px] px-[15px] rounded-lg"
        >
          {task?.status}
        </span>
        <Progress size={30} strokeWidth={2} currentValue={100} />
      </div>
    </div>
  );
};

export default Task;
