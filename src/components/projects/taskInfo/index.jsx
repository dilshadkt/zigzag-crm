import React from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../shared/progress";
import PrimaryButton from "../../shared/buttons/primaryButton";

const TaskInfo = ({ taskDetails }) => {
  return (
    <div className="col-span-1 bg-white rounded-3xl px-2 justify-between  py-5 flex flex-col">
      <div>
        <div className="gap-y-3 flex flex-col mx-3">
          <h4 className="font-medium">Task Info</h4>
          <div className="flex flex-col  gap-y-2">
            <span className="text-sm text-[#91929E]">Reporter</span>
            <div className="flexStart gap-x-3">
              <div className="w-6 h-6  rounded-full overflow-hidden">
                <img src="/image/photo.png" alt="" />
              </div>
              <span>Evan Yates</span>
            </div>
          </div>
          <div className="flex flex-col  gap-y-2">
            <span className="text-sm text-[#91929E]">Assigned</span>
            <div className="flexStart gap-x-3">
              <div className="w-6 h-6  rounded-full overflow-hidden">
                <img
                  src={taskDetails?.assignedTo?.profileImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{taskDetails?.assignedTo?.firstName}</span>
            </div>
          </div>
          <div className="flex flex-col  gap-y-2">
            <span className="text-sm text-[#91929E]">Priority</span>
            <div className="flexStart gap-x-1 text-[#FFBD21]">
              <IoArrowUpOutline className="text-xl " />
              <span className="text-sm">{taskDetails?.priority}</span>
            </div>
          </div>
        </div>

        <div className=" rounded-2xl mt-5 p-4 bg-[#F4F9FD]  flex flex-col">
          <h4 className="font-medium">Time tracking</h4>
          <div className="flexStart gap-x-3 my-3">
            <Progress size={33} strokeWidth={2} currentValue={43} />
            <div className="flex flex-col ">
              <span className="text-sm">1d 3h 25m logged</span>
              <span className="text-xs text-[#91929E] ">
                Original Estimate 3d 8h
              </span>
            </div>
          </div>
          <PrimaryButton
            title={"Log time"}
            icon={"/icons/time.svg"}
            className={"w-fit "}
          />
        </div>
        <div className="gap-y-3 mt-1 flex flex-col mx-3">
          <div className="flex flex-col  gap-y-1">
            <span className="text-sm text-[#91929E]">Dead Line</span>
            <span className="text-sm text-[#0A1629]">Feb 23, 2020</span>
          </div>
        </div>
      </div>
      <div className="flexStart px-3">
        <img src="/icons/calender2.svg" alt="" className="w-4" />
        <span className="text-sm  text-[#7D8592]">Created May 28, 2020</span>
      </div>
    </div>
  );
};

export default TaskInfo;
