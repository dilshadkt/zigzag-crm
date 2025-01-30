import React from "react";
import Progress from "../../shared/progress";
import ActivityCard from "../activityCard";

const EmployeeActivity = () => {
  return (
    <div className="w-full h-full gap-7 grid grid-cols-4">
      {new Array(8).fill(" ").map((item, index) => (
        <ActivityCard key={index} />
      ))}
    </div>
  );
};

export default EmployeeActivity;
