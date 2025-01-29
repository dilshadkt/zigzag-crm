import React from "react";
import ProjectTask from "../task";
import PrimaryButton from "../../shared/buttons/primaryButton";

const ProjectOverView = () => {
  return (
    <div className="col-span-4 overflow-hidden   flex flex-col">
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        <PrimaryButton icon={"/icons/filter.svg"} className={"bg-white"} />
      </div>

      <div className="flex flex-col h-full gap-y-4 mt-4  rounded-xl overflow-hidden   overflow-y-auto">
        {/* task  */}
        <div className="min-h-10 font-medium  sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
          Active Tasks
        </div>
        {new Array(6).fill(" ").map((task, index) => (
          <ProjectTask key={index} />
        ))}
        {/* back log  */}
        <div className="min-h-10 font-medium  sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
          Backlog
        </div>
        {new Array(6).fill(" ").map((task, index) => (
          <ProjectTask key={index} />
        ))}
      </div>
    </div>
  );
};

export default ProjectOverView;
