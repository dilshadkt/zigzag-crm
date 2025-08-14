import React from "react";
import Progress from "../../shared/progress";
import ActivityCard from "../activityCard";
import { useNavigate } from "react-router-dom";

const EmployeeActivity = ({ employees }) => {
  const navigate = useNavigate();
  const handleNavigateToEmployee = (employee) => {
    navigate(`/employees/${employee._id}`);
  };
  return (
    <div className=" gap-5 grid grid-cols-1 h-full md:grid-cols-4">
      {employees?.map((employee, index) => (
        <ActivityCard
          key={index}
          employee={employee}
          onClick={() => handleNavigateToEmployee(employee)}
        />
      ))}
    </div>
  );
};

export default EmployeeActivity;
