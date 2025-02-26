import React from "react";

const AuthBanner = () => {
  return (
    <div className="w-full h-full bg-[#3F8CFF] flexCenter flex-col px-6 ">
      <div className="flex flex-col gap-y-7">
        <div className="flexStart pl-7 gap-x-4">
          <img src="/image/logo.svg" alt="" className="w-10" />
          <h1 className="text-2xl  text-white font-bold">Woorkroom</h1>
        </div>
        <h2 className="  text-4xl font-bold text-white pl-7 ">
          Your place to work <br /> Plan. Create. Control.
        </h2>
        <img
          src="/image/login.svg"
          alt=""
          className="w-[480px] opacity-85 scale-80 -translate-x-10"
        />
      </div>
    </div>
  );
};

export default AuthBanner;
