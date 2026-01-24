import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Progress from "../../../shared/progress";

const EmployeeCard = ({ employee, index }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    navigate(`/employees/${employee._id}`);
  };

  const progressValue =
    typeof employee?.progressValue === "number"
      ? employee.progressValue
      : employee?.progress_value || 0;

  const employeeName =
    employee.name ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Unnamed";

  const profileImage =
    employee?.profileImage ||
    employee?.profile ||
    `/image/dummy/avatar1.svg`;

  const firstLetter = employeeName.charAt(0).toUpperCase();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={handleClick}
      key={employee._id || index}
      className="flex flex-col items-center rounded-3xl bg-[#F4F9FD] p-4 py-4 
             h-fit cursor-pointer"
    >
      <div className="relative">
        <Progress
          size={69}
          strokeWidth={2}
          currentValue={progressValue}
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full rounded-full scale-85 flexCenter overflow-hidden">
          {!imageError && profileImage !== `/image/dummy/avatar1.svg` ? (
            <img
              src={profileImage}
              alt=""
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flexCenter text-gray-800 font-semibold text-xl">
              {firstLetter}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-y-1 mt-2">
        <h4 className="font-medium text-center text-sm capitalize">
          {employeeName}
        </h4>
        <span className="text-sm text-gray-500">
          {employee.position || "—"}
        </span>
        <div className="text-[#7D8592] border-2 text-xs border-[#7D8592]/60 rounded-lg px-2 mt-2">
          {employee.level || "Middle"}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
