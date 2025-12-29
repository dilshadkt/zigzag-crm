import React, { useState } from "react";
import { useGetEmployeeVacations } from "../../api/hooks";
import Progress from "../shared/progress";
import LeaveCard from "../shared/LeaveCard";

const Vacations = ({ employeeId }) => {
  const [currentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data, isLoading } = useGetEmployeeVacations(
    employeeId,
    currentMonth,
    currentYear
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        No vacation data found for this employee
      </div>
    );
  }

  const { summary, vacations } = data;

  // Calculate vacation limits - these would ideally come from a company policy setting
  const vacationLimit = 16;
  const sickLeaveLimit = 12;
  const remoteWorkLimit = 50;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="grid grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={vacationLimit - (summary?.vacation || 0)}
                target={vacationLimit}
                DefaultPathColor="#15C0E6"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#15C0E6]"
              >
                {vacationLimit - (summary?.vacation || 0)}
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">Vacation</h4>
            <p className="text-xs text-gray-400 font-medium">
              {vacationLimit - (summary?.vacation || 0)}/{vacationLimit} days
              available
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={sickLeaveLimit - (summary?.sick_leave || 0)}
                target={sickLeaveLimit}
                DefaultPathColor="#F65160"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#F65160]"
              >
                {sickLeaveLimit - (summary?.sick_leave || 0)}
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">
              Sick Leave
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              {sickLeaveLimit - (summary?.sick_leave || 0)}/{sickLeaveLimit}{" "}
              days available
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={remoteWorkLimit - (summary?.remote_work || 0)}
                target={remoteWorkLimit}
                DefaultPathColor="#6D5DD3"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#6D5DD3]"
              >
                {remoteWorkLimit - (summary?.remote_work || 0)}
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">
              Work Remotely
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              {remoteWorkLimit - (summary?.remote_work || 0)}/{remoteWorkLimit}{" "}
              days available
            </p>
          </div>
        </div>
      </div>
      <h3 className="text-sm font-bold my-3 ml-1  text-gray-600">
        Vacation Requests
      </h3>
      <div className="w-full h-full overflow-y-auto">
        {vacations && vacations.length > 0 ? (
          vacations.map((vacation) => (
            <LeaveCard
              key={vacation._id}
              request={{
                id: vacation._id,
                type: vacation.type,
                status: vacation.status,
                startDate: vacation.startDate,
                endDate: vacation.endDate,
                duration: vacation.durationDays,
                reason: vacation.reason,
                project: vacation.project?.name,
                createdAt: vacation.createdAt,
                approvedBy: vacation.approvedBy
                  ? `${vacation.approvedBy.firstName} ${vacation.approvedBy.lastName}`
                  : null,
              }}
            />
          ))
        ) : (
          <div className="bg-white h-full flexCenter rounded-3xl p-6 text-center text-gray-500">
            No vacation requests found
          </div>
        )}
      </div>
    </div>
  );
};

export default Vacations;
