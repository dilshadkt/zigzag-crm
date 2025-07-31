import React from "react";
import Navigator from "../../components/shared/navigator";
import { Outlet } from "react-router-dom";

const TaskDetailLayout = () => {
  return (
    <section className="flex flex-col  h-full gap-y-1">
      <Navigator title={"Back to Board"} />
      <div className="w-full h-full flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </section>
  );
};

export default TaskDetailLayout;
