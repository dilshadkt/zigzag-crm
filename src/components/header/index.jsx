import React, { useState } from "react";
import PrimaryButton from "../shared/buttons/primaryButton";
import NotificationBar from "../notificationBar";

const DashboardHeader = () => {
  const [isNotifyMenuOpen, setNotifyMenuOpen] = useState(false);
  return (
    <div className="flexBetween">
      <div className="relative  w-1/3">
        <input
          type="text"
          className="bg-white py-3 text-sm w-full  rounded-[14px] pr-3 pl-11 outline-none"
          placeholder="Search"
        />
        <img
          src="/icons/search.svg"
          alt=""
          className="absolute top-0 bottom-0 h-fit my-auto left-3"
        />
      </div>
      <div className="flexEnd gap-x-4  ">
        <button
          onClick={() => setNotifyMenuOpen(true)}
          className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white "
        >
          <img src="/icons/alert.svg" alt="" className="w-5" />
        </button>
        <div className="h-12 rounded-[14px] gap-x-2 px-3 w-fit bg-white flexCenter  ">
          <div className="w-[30px] aspect-square rounded-full overflow-hidden bg-black"></div>
          <div className="flexStart gap-x-3.5 cursor-pointer">
            <span className="text-sm font-medium ">Zubair</span>
            <img src="/icons/arrowDown.svg" alt="" className="w-5" />
          </div>
        </div>
      </div>
      {isNotifyMenuOpen && (
        <NotificationBar setNotifyMenuOpen={setNotifyMenuOpen} />
      )}
    </div>
  );
};

export default DashboardHeader;
