import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useEmpoyees } from "../../../api/hooks";
import Progress from "../../shared/progress";

const WorkLoad = () => {
  const { data, isLoading } = useEmpoyees(1);
  const employees = data?.employees?.slice(0, 8) || [];
  const navigate = useNavigate();

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
            <div
              onClick={() => {
                navigate(`/employees/${employee._id}`);
              }}
              key={employee._id || index}
              className="flex flex-col items-center rounded-3xl bg-[#F4F9FD] p-4 py-4 
             h-fit cursor-pointer"
            >
              <div className="relative">
                <Progress
                  size={69}
                  strokeWidth={2}
                  currentValue={
                    typeof employee?.progressValue === "number"
                      ? employee.progressValue
                      : employee?.progress_value || 0
                  }
                />
                <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full rounded-full scale-85 flexCenter overflow-hidden">
                  <img
                    src={
                      employee?.profileImage ||
                      employee?.profile ||
                      `/image/dummy/avatar1.svg`
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-y-1 mt-2">
                <h4 className="font-medium">
                  {employee.name ||
                    `${employee.firstName || ""} ${
                      employee.lastName || ""
                    }`.trim() ||
                    "Unnamed"}
                </h4>
                <span className="text-sm text-gray-500">
                  {employee.position || "—"}
                </span>
                <div className="text-[#7D8592] border-2 text-xs border-[#7D8592]/60 rounded-lg px-2 mt-2">
                  {employee.level || "Middle"}
                </div>
              </div>
            </div>
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
