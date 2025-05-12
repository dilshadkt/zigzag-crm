import React from "react";

const LeaveCard = () => {
  return (
    <div className="bg-white rounded-3xl p-6 grid grid-cols-3">
      <div className="flex flex-col  max-w-sm w-full  ">
        <span className="text-xs font-medium text-[#91929E]">Request Type</span>
        <div className="flexStart gap-x-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#F65160]"></div>
          <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
            Sick Leave
          </span>
        </div>
      </div>
      <div className=" col-span-2 grid grid-cols-4 w-full ">
        <div className="flex flex-col gap-y-2">
          <span className="text-xs font-medium text-[#91929E]">Duration</span>
          <span className="font-semibold text-gray-800 text-sm">3 days</span>
        </div>
        <div className="flex flex-col gap-y-2">
          <span className="text-xs font-medium text-[#91929E]">Start Day</span>
          <span className="font-semibold text-gray-800 text-sm">
            Sep 13, 2020
          </span>
        </div>
        <div className="flex flex-col gap-y-2">
          <span className="text-xs font-medium text-[#91929E]">End Day</span>
          <span className="font-semibold text-gray-800 text-sm">
            Sep 16, 2020
          </span>
        </div>
        <div className="flexEnd">
          <button
            className="bg-[#FDC748] text-white
          text-sm min-w-28 cursor-pointer font-medium rounded-lg p-2 w-fit h-fit"
          >
            Pending{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveCard;
