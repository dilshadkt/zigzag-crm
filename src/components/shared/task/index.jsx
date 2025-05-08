import React from "react";
import Progress from "../progress";
import { IoArrowUpOutline } from "react-icons/io5";

const Task = ({ task, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };
  return (
    <div
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
              src={task?.assignedTo.profileImage}
              alt={task?.assignedTo?.firstName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-[#91929E]">Priority</span>
          <div className="flexStart gap-x-1 text-[#FFBD21]">
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
