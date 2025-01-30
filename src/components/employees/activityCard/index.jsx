import React from "react";
import Progress from "../../shared/progress";

const ActivityCard = () => {
  return (
    <div className="h-[320px] p-2 gap-y-6 flex flex-col bg-white rounded-3xl">
      <div className="min-h-[186px] bg-[#F4F9FD] rounded-3xl flexCenter flex-col">
        <div className="relative">
          <Progress size={58} strokeWidth={2} currentValue={80} />
          <div
            className="absolute top-0
left-0 right-0 bottom-0 w-full h-full rounded-full
flexCenter overflow-hidden "
          >
            <img
              src="/image/photo.png"
              alt=""
              className="w-full h-full object-cover scale-88"
            />
          </div>
        </div>
        <h4 className="font-medium mt-4">Shawn Stone</h4>
        <span className="text-sm">UI/UX Designer</span>
        <span className="text-[#7D8592] border mt-2 border-[#7D8592]/70 rounded-md px-1 text-xs">
          Middle
        </span>
      </div>
      <div className="w-full h-full grid grid-cols-3  gap-x-3 px-2">
        <div className="flex flex-col items-center">
          <span className="text-[26px] font-medium">0</span>
          <span className="text-sm text-[#91929E] text-center">
            Backlog tasks
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[26px] font-medium">16</span>
          <span className="text-sm text-[#91929E] text-center">
            Backlog tasks
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[26px] font-medium">6</span>
          <span className="text-sm text-[#91929E] text-center">
            Backlog tasks
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
