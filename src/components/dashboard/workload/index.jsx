import React from "react";
import CircularProgressProfile from "./card/progressProfile";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";

const WorkLoad = () => {
  return (
    <div className=" px-4 col-span-5 h-[470px] bg-white pb-3 pt-5  flex flex-col rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Workload</h4>
        <Link
          to={"/workload"}
          className="text-[#3F8CFF] cursor-pointer text-sm flexStart gap-x-2"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight />
        </Link>
      </div>
      <div className="w-full h-full grid grid-cols-4 gap-3 mt-3">
        {new Array(8).fill(" ").map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-3xl bg-[#F4F9FD] p-4 py-4"
          >
            <CircularProgressProfile currentValue={50} />
            <div className="flex flex-col items-center gap-y-1 mt-2">
              <h4 className="font-medium">Shawn Stone</h4>
              <span className="text-sm text-gray-500">UI/UX Designer</span>
              <div className="text-[#7D8592] border-2 text-xs border-[#7D8592]/60 rounded-lg px-2 mt-2">
                {" "}
                Middle
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkLoad;
