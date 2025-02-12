import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="h-screen w-full p-5 bg-[#F4F9FD]">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
