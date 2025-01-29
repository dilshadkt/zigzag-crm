import React, { useState } from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../components/shared/progress";

const Employees = () => {
  const [stat, setStat] = useState("list");
  const renderStat = () => {
    if (stat === "list") {
      return (
        <>
          {new Array(8).fill(" ").map((item, index) => (
            <div
              key={index}
              className=" rounded-3xl bg-white py-5 px-7 grid grid-cols-3"
            >
              <div className="flexStart gap-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src="/image/photo.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Evan Yates</span>
                  <span className="text-sm text-[#91929E]">
                    evanyates@gmail.com
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3">
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Gender</h5>
                  <span>Male</span>
                </div>
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Birthday</h5>
                  <span>Apr 12, 1995</span>
                </div>
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Full age</h5>
                  <span>25</span>
                </div>
              </div>
              <div className="flexBetween">
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Gender</h5>
                  <div className="flexStart gap-x-1">
                    <span>UI/UX Designer</span>
                    <span className="text-xs border mt-1 text-[#7D8592] border-[#7D8592]/50 px-1 rounded-md">
                      Middle
                    </span>
                  </div>
                </div>
                <PrimaryButton
                  className={"bg-[#F4F9FD]"}
                  icon={"/icons/dot.svg"}
                />
              </div>
            </div>
          ))}
        </>
      );
    } else {
      return (
        <div className="w-full h-full gap-7 grid grid-cols-4">
          {new Array(8).fill(" ").map((item, index) => (
            <div
              key={index}
              className="h-[320px] p-2 gap-y-6 flex flex-col bg-white rounded-3xl"
            >
              <div className="min-h-[186px] bg-[#F4F9FD] rounded-3xl flexCenter flex-col">
                <div className="relative">
                  <Progress size={58} strokeWidth={2} currentValue={80} />
                  <div
                    className="absolute top-0
        left-0 right-0 bottom-0 w-full h-full rounded-full
        flexCenter overflow-hidden "
                  >
                    <img
                      src="/image/photo.png"
                      alt=""
                      className="w-full h-full object-cover scale-88"
                    />
                  </div>
                </div>
                <h4 className="font-medium mt-4">Shawn Stone</h4>
                <span className="text-sm">UI/UX Designer</span>
                <span className="text-[#7D8592] border mt-2 border-[#7D8592]/70 rounded-md px-1 text-xs">
                  Middle
                </span>
              </div>
              <div className="w-full h-full grid grid-cols-3  gap-x-3 px-2">
                <div className="flex flex-col items-center">
                  <span className="text-[26px] font-medium">0</span>
                  <span className="text-sm text-[#91929E] text-center">
                    Backlog tasks
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[26px] font-medium">16</span>
                  <span className="text-sm text-[#91929E] text-center">
                    Backlog tasks
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[26px] font-medium">6</span>
                  <span className="text-sm text-[#91929E] text-center">
                    Backlog tasks
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };
  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>Employees (28)</Header>
        <div className="h-11 w-[300px]  mt-2 rounded-3xl grid grid-cols-2 p-1  bg-[#E6EDF5]">
          {["list", "activity"].map((item, index) => (
            <button
              key={index}
              onClick={() => setStat(`${item}`)}
              className={`h-full capitalize w-full cursor-pointer
                 rounded-[20px]  ${
                   stat === item ? `bg-[#3F8CFF] text-white ` : `text-gray-800`
                 } 
            flexCenter`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flexEnd gap-x-5">
          <PrimaryButton
            icon={"/icons/filter.svg"}
            className={"bg-white px-2 mt-3"}
          />
          <PrimaryButton
            icon={"/icons/add.svg"}
            title={"Add Employee"}
            className={"mt-3 px-5"}
          />
        </div>
      </div>
      <div className="w-full h-full  overflow-y-auto gap-y-4 mt-3  flex flex-col">
        {renderStat()}
      </div>
      <div className="flexEnd">
        <div className="h-11 flexCenter gap-x-3 bg-white px-4 rounded-[14px]">
          <span>1-8 of 28</span>
          <div className="flexStart gap-x-1">
            <button className="cursor-pointer hover:scale-70 transition-all duration-100">
              <IoArrowUpOutline className="text-xl text-[#C9CCD1] -rotate-90 w-5" />
            </button>
            <button className="cursor-pointer hover:scale-70 transition-all duration-100">
              <IoArrowUpOutline className="text-xl text-[#3F8CFF] rotate-90 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Employees;
