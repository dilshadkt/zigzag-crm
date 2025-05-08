import React from "react";

const NoTask = ({ children }) => {
  return (
    <div className="w-full h-full gap-y-5  flexCenter flex-col">
      <img src="/image/projects/noTask.png" alt="" className="w-2xs" />
      <h4 className="font-semibold text-lg  leading-6 max-w-sm text-center">
        {children}
      </h4>
      {/* <PrimaryButton
icon={"/icons/add.svg"}
title={"Add Task"}
onclick={() => setShowModalTask(true)}
/> */}
    </div>
  );
};

export default NoTask;
