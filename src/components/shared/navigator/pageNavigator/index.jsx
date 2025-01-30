import React from "react";
import { IoArrowUpOutline } from "react-icons/io5";

const PageNavigator = () => {
  return (
    <div className="h-11 flexCenter gap-x-3 bg-white px-4 rounded-[14px]">
      <span>1-8 of 28</span>
      <div className="flexStart gap-x-1">
        <button className="cursor-pointer hover:scale-70 transition-all duration-100">
          <IoArrowUpOutline className="text-xl text-[#C9CCD1] -rotate-90 w-5" />
        </button>
        <button className="cursor-pointer hover:scale-70 transition-all duration-100">
          <IoArrowUpOutline className="text-xl text-[#3F8CFF] rotate-90 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PageNavigator;
