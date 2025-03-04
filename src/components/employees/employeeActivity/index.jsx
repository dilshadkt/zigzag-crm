import React from "react";
import Progress from "../../shared/progress";
import ActivityCard from "../activityCard";
import { EMPOYEES } from "../../../constants";

const EmployeeActivity = ({ employees }) => {
  return (
    <div className="w-full h-full gap-7 grid grid-cols-4">
      {EMPOYEES.map((item, index) => (
        <ActivityCard key={index} employee={item} />
      ))}
    </div>
  );
};

export default EmployeeActivity;
