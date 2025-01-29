import React from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../components/shared/progress";
import { Link } from "react-router-dom";

const Prjects = () => {
  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>Projects</Header>
        <PrimaryButton
          icon={"/icons/add.svg"}
          title={"Add Task"}
          className={"mt-3"}
        />
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <div
          className="col-span-1 bg-white overflow-hidden text-[#0A1629]
         rounded-3xl  flex flex-col "
        >
          <div className="flexCenter border-b  border-[#E4E6E8] gap-x-2 py-5">
            <button className="flexCenter cursor-pointer">
              <span className="font-medium ">Current Projects</span>
              <img src="/icons/arrowDown.svg" alt="" />
            </button>
          </div>
          {/* projects  */}
          <div
            className="flex flex-col h-full my-2 pl-2    
            gap-y-2 overflow-y-auto"
          >
            {/* project card  */}
            {new Array(5).fill(" ").map((project, index) => (
              <div
                key={index}
                className="hover:bg-[#F4F9FD] 
                 cursor-pointer relative rounded-2xl px-4
                  gap-y-1.5  group  mr-3 py-3 flex flex-col"
              >
                <span className="text-xs text-[#91929E]">PN0001245</span>
                <h4 className="font-medium text-gray-800 text-sm">
                  Medical App (iOS native)
                </h4>
                <Link
                  to={`/projects/Medical-app`}
                  className="flexStart hover:underline w-fit cursor-pointer gap-x-1 text-[#3F8CFF]"
                >
                  <span className="text-sm"> View details</span>
                  <MdOutlineKeyboardArrowRight className="translate-y-0.5" />
                </Link>
                {/* the side bar  */}
                <div
                  className="absolute w-1 top-0  -right-3
                h-0 group-hover:h-full transition-all duration-300  bg-[#3F8CFF] rounded-full "
                ></div>
              </div>
            ))}
          </div>
        </div>
        {/* project detail page  */}
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
              <div
                key={index}
                className="grid grid-cols-10 gap-x-3 px-5 bg-white py-5 rounded-3xl"
              >
                <div className="col-span-3 gap-y-1 flex flex-col">
                  <span className="text-sm text-[#91929E]">Task Name</span>
                  <h4>Research</h4>
                </div>
                <div className="col-span-5  grid grid-cols-4">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Estimate</span>
                    <h4>1d 2h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Spent Time</span>
                    <h4>1d 2h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Assignee</span>
                    <div className="w-6 h-6 rounded-full  flexCenter">
                      <img src="/image/photo.png" alt="" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Priority</span>
                    <div className="flexStart gap-x-1 text-[#FFBD21]">
                      <IoArrowUpOutline className="text-lg " />
                      <span className="text-xs font-medium">Medium</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2  flexBetween">
                  <span
                    className="bg-[#E0F9F2] text-[#00D097] 
                  flexCenter text-xs font-medium py-[7px] px-[15px] rounded-lg"
                  >
                    Done
                  </span>
                  <Progress size={30} strokeWidth={2} currentValue={100} />
                </div>
              </div>
            ))}
            {/* back log  */}
            <div className="min-h-10 font-medium  sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
              Backlog
            </div>
            {new Array(6).fill(" ").map((task, index) => (
              <div
                key={index}
                className="grid grid-cols-10 gap-x-3 px-5 bg-white py-5 rounded-3xl"
              >
                <div className="col-span-3 gap-y-1 flex flex-col">
                  <span className="text-sm text-[#91929E]">Task Name</span>
                  <h4>Research</h4>
                </div>
                <div className="col-span-5  grid grid-cols-4">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Estimate</span>
                    <h4>1d 2h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Spent Time</span>
                    <h4>1d 2h</h4>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Assignee</span>
                    <div className="w-6 h-6 rounded-full  flexCenter">
                      <img src="/image/photo.png" alt="" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#91929E]">Priority</span>
                    <div className="flexStart gap-x-1 text-[#FFBD21]">
                      <IoArrowUpOutline className="text-lg " />
                      <span className="text-xs font-medium">Medium</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2  flexBetween">
                  <span
                    className="bg-[#E0F9F2] text-[#00D097] 
                  flexCenter text-xs font-medium py-[7px] px-[15px] rounded-lg"
                  >
                    Done
                  </span>
                  <Progress size={30} strokeWidth={2} currentValue={100} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Prjects;
