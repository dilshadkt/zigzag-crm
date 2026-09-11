import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
import { useEmpoyees } from "../../../api/hooks";
import EmployeeCard from "./card/EmployeeCard";

const WorkLoad = () => {
  const { data, isLoading } = useEmpoyees(1);
  const employees = data?.employees?.slice(0, 8) || [];

  return (
    <div className="px-3 md:px-4 bg-white h-full pb-3 pt-4 md:pt-5 flex flex-col rounded-2xl md:rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-base md:text-lg text-gray-800">Workload</h4>
        {employees.length > 0 && (
          <Link
            to={"/workload"}
            className="text-[#3F8CFF] cursor-pointer text-sm flexStart gap-x-2"
          >
            <span>View all</span>
            <MdOutlineKeyboardArrowRight />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-2xl md:rounded-3xl bg-[#F4F9FD] p-3 md:p-4 py-4"
            >
              <div className="h-[69px] w-[69px] rounded-full bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%]" />
              <div className="h-4 w-20 mt-3 rounded bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%]" />
              <div className="h-3 w-16 mt-2 rounded bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%]" />
            </div>
          ))}
        </div>
      ) : employees.length > 0 ? (
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-3">
          {employees.map((employee, index) => (
            <EmployeeCard key={employee._id || index} employee={employee} index={index} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-3">
              <i className="far fa-chart-bar"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No workload data available
            </h3>
            <p className="text-gray-500 text-sm">
              Workload information will appear here once data is available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkLoad;
