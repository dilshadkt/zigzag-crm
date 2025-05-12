import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
import { useEmpoyees } from "../../../api/hooks";
import Progress from "../../shared/progress";

const WorkLoad = () => {
  const { data } = useEmpoyees(1);
  const employees = data?.employees?.slice(0, 8) || [];


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
        {employees.map((employee, index) => (
          <div
            key={employee._id || index}
            className="flex flex-col items-center rounded-3xl bg-[#F4F9FD] p-4 py-4"
          >
            <div className="relative">
              <Progress
                size={69}
                strokeWidth={2}
                currentValue={employee?.progress_value || 50}
              />
              <div className="absolute
               top-0 left-0 right-0 bottom-0 w-full h-full 
                rounded-full rounded-full w-6 h-6  scale-85 flexCenter overflow-hidden">
                <img
                  src={employee?.profile || `/image/dummy/avatar1.svg`}
                  alt=""
                  className="w-full h-full object-cover "
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-y-1 mt-2">
              <h4 className="font-medium">{employee.name}</h4>
              <span className="text-sm text-gray-500">{employee.position}</span>
              <div className="text-[#7D8592] border-2 text-xs border-[#7D8592]/60 rounded-lg px-2 mt-2">
                {employee.level || "Middle"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkLoad;
