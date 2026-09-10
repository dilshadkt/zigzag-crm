import React from "react";
import Navigator from "../../components/shared/navigator";
import { Outlet } from "react-router-dom";
import PageSuspense from "../../components/shared/PageSuspense";

const TaskDetailLayout = () => {
  return (
    <section className="flex flex-col  h-full gap-y-1">
      <Navigator />
      <div className="w-full h-full flex flex-col overflow-hidden">
        <PageSuspense>
          <Outlet />
        </PageSuspense>
      </div>
    </section>
  );
};

export default TaskDetailLayout;
