import React from "react";

const NoEmployees = ({ children }) => {
  return (
    <div className="w-full h-full gap-y-5 flexCenter flex-col">
      <img src="/image/projects/noTask.png" alt="" className="w-2xs" />
      <h4 className="font-semibold text-lg leading-6 max-w-sm text-center">
        {children}
      </h4>
    </div>
  );
};

export default NoEmployees;
