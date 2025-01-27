import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoArrowUpOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const NearestEvents = () => {
  return (
    <div className="flex  h-[470px] flex-col col-span-2 bg-white  py-5 px-4  rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Nearest Events</h4>
        <Link
          to={"/events"}
          className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight />
        </Link>
      </div>
      <div className=" w-full h-full overflow-y-auto mt-3 gap-y-8 flex flex-col pt-2 ">
        {new Array(3).fill(" ").map((event, index) => (
          <div
            key={index}
            className="flex relative  justify-between  h-full pl-3 flex-col gap-y-2 w-full "
          >
            <div className="flexBetween w-full ">
              <p className="w-[80%]  ">Presentation of the new department</p>
              <IoArrowUpOutline className="text-xl text-[#FFBD21]" />
            </div>
            <div className="flexBetween w-full ">
              <p className="w-[80%]  text-xs text-[#91929E] ">
                Today | 5:00 PM
              </p>
              <div className="h-8 bg-[#F4F9FD] px-3 gap-x-1 text-[#7D8592] flexStart rounded-lg">
                <img src="/icons/clock.svg" alt="" />
                <span className="text-xs">4h</span>
              </div>
            </div>
            <div className="w-1 bg-[#3F8CFF] rounded-full h-full absolute left-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearestEvents;
