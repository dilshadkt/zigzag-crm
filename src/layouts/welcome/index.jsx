import React from "react";
import AuthBanner from "../../components/authBanner";
import { Outlet } from "react-router-dom";

const WelcomeLayout = () => {
  return (
    <main className="h-screen w-full p-5 bg-[#F4F9FD]">
      <section className="w-full h-full bg-white grid grid-cols-2 rounded-3xl overflow-hidden">
        <AuthBanner />
        <div className="flexCenter ">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default WelcomeLayout;
