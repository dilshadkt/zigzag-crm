import React from "react";
import EmployeeCard from "../shared/employeeCard";

const Teams = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <div
        className="text-center w-full h-full flex items-center 
      justify-center text-gray-500"
      >
        No teams found for this employee
      </div>
    );
  }

  return (
    <div className="w-full h-fit grid grid-cols-4 gap-3 mt-3">
      {teams.map((team) => {
        const fullName =
          team?.firstName || team?.lastName
            ? `${team?.firstName || ""} ${team?.lastName || ""}`.trim()
            : team?.name || "Team Member";

        return (
          <EmployeeCard
            key={team._id}
            employee={{
              name: fullName,
              email: team.email,
              profile: team.profileImage,
              position: team.position,
              level: team.level,
              progress_value: team.progressValue,
            }}
            className="bg-white h-fit"
          />
        );
      })}
    </div>
  );
};

export default Teams;
