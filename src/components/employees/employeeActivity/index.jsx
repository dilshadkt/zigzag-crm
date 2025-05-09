import React from "react";
import Progress from "../../shared/progress";
import ActivityCard from "../activityCard";

const EmployeeActivity = ({ employees }) => {
  return (
    <div className="w-full h-full gap-7 grid grid-cols-4">
      {employees?.map((employee, index) => (
        <ActivityCard key={index} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeActivity;
