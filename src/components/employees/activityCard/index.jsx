import React from "react";
import Progress from "../../shared/progress";

const ActivityCard = ({ employee }) => {
  console.log(employee)
  const genereteBgColor = (value) => {
    if (value > 50) {
      return "#F4F9FD";
    } else if (value > 30) {
      return "#FFF7E5";
    } else {
      return "#fbd9ca";
    }
  };
  return (
    <div className="h-[320px] p-2 gap-y-6 flex flex-col bg-white rounded-3xl">
      <div
        style={{
          background: genereteBgColor(employee?.progress_value),
        }}
        className="min-h-[186px]  relative rounded-3xl flexCenter flex-col"
      >
        {employee?.progress_value > 30 && employee?.progress_value < 50 && (
          <img src="/icons/lazzy.svg" alt="" className="absolute top-5" />
        )}
        <div className="relative">
          <Progress
            size={58}
            strokeWidth={2}
            currentValue={employee?.progress_value}
          />
          <div
            className="absolute top-0
left-0 right-0 bottom-0 w-full h-full rounded-full
flexCenter overflow-hidden w-6 h-6 scale-85 "
          >
            <img
              src={employee?.profile || `/image/dummy/avatar1.svg`}
              alt=""
              className="w-full h-full object-cover "
            />
          </div>
        </div>
        <h4 className="font-medium mt-4">{employee?.name}</h4>
        <span className="text-sm">{employee?.position}</span>
        <span className="text-[#7D8592] border mt-2 border-[#7D8592]/70 rounded-md px-1 text-xs">
          {employee?.level}
        </span>
      </div>
      <div className="w-full h-full grid grid-cols-3  gap-x-3 px-2">
        <div className="flex flex-col items-center">
          <span className="text-[26px] font-medium">
            {employee?.backlog_tasks}
          </span>
          <span className="text-sm text-[#91929E] text-center">
            Backlog tasks
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[26px] font-medium">
            {employee?.tasks_in_progress}
          </span>
          <span className="text-sm text-[#91929E] text-center">
            Tasks In Progress
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[26px] font-medium">
            {employee?.tasks_in_review}
          </span>
          <span className="text-sm text-[#91929E] text-center">
            Tasks In Review
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
