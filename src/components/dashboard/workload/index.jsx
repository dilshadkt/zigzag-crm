import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
import { useEmpoyees } from "../../../api/hooks";
import EmployeeCard from "./card/EmployeeCard";

const WorkLoad = () => {
  const { data, isLoading } = useEmpoyees(1);
  const employees = data?.employees?.slice(0, 8) || [];

  return (
    <div className="px-4 md:col-span-5  bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Workload</h4>
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
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-500">
            Loading workload data...
          </div>
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
