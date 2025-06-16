import React from "react";
import Sidebar from "../../components/sidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../../components/header";

const DashboardLayout = () => {
  return (
    <main className="bg-[#F4F9FD] gap-x-2 h-screen overflow-hidden flex ">
      <Sidebar />
      <section className="w-full gap-y-6 h-full overflow-auto flex flex-col p-3  ">
        <DashboardHeader />
        <div className="px-1 w-full h-full overflow-hidden ">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default DashboardLayout;
