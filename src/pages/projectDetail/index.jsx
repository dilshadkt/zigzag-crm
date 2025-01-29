import React from "react";
import Header from "../../components/shared/header";
import AddButton from "../../components/shared/buttons/addButton";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import IconButton from "../../components/shared/buttons/iconButton";
import Progress from "../../components/shared/progress";
import { IoArrowUpOutline } from "react-icons/io5";
import Navigator from "../../components/shared/navigator";

const ProjectDetails = () => {
  return (
    <section className="flex flex-col h-full gap-y-1">
      <Navigator path={"/projects"} title={"Back to Projects"} />
      <div className="flexBetween   mb-2">
        <Header>Medical App (iOS native)</Header>
        <AddButton className={"mt-3"} />
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <div
          className="col-span-1 bg-white overflow-y-auto text-[#0A1629]
     rounded-3xl  flex flex-col  p-4"
        >
          <div className="flex flex-col overflow-y-auto">
            <div className="flexBetween">
              <span className="text-sm text-[#91929E] ">Project Number</span>
              <div className="w-11 h-11 bg-[#F4F9FD] flexCenter rounded-xl">
                <img src="/icons/edit.svg" alt="" className="w-5" />
              </div>
            </div>
            <span className="-translate-y-1.5">PN0001245</span>
            <div className="flex flex-col gap-y-2 my-4">
              <h4 className="font-medium">Description</h4>
              <p className="text-[#0A1629]/80">
                App for maintaining your medical record, making appointments
                with a doctor, storing prescriptions
              </p>
            </div>
            <div className="flex flex-col gap-y-5 mt-1">
              <div className="flex flex-col gap-y-2">
                <span className="text-sm text-[#91929E]">Reporter </span>
                <div className="flexStart gap-x-3 ">
                  <div className="w-6 h-6 rounded-full overflow-hidden flexCenter">
                    <img src="/image/photo.png" alt="" />
                  </div>
                  <span>Evan Yates</span>
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-sm text-[#91929E]">Priority </span>
                <div className="flexStart gap-x-2  text-[#FFBD21]">
                  <IoArrowUpOutline className="text-lg " />
                  <span className="text-sm font-medium">Medium</span>
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-sm text-[#91929E]">Dead Line </span>
                <span className="text-sm  font-medium text-gray-800">
                  Feb 23, 2020
                </span>
              </div>
              <div className="flex flex-col gap-y-2">
                <div className="flexStart gap-x-2">
                  <img src="/icons/fillCalender.svg" alt="" className="w-4" />
                  <span className="text-sm text-[#91929E]">
                    Created May 28, 2020{" "}
                  </span>
                </div>
                <div className="flexStart gap-x-2">
                  <IconButton
                    icon={"/icons/file.svg"}
                    className={"bg-[#6D5DD3]/10"}
                  />
                  <IconButton
                    icon={"/icons/link.svg"}
                    className={"bg-[#15C0E6]/10"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* project detail page  */}
        <div className="col-span-4 overflow-hidden   flex flex-col">
          <div className="flexBetween">
            <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
            <IconButton icon={"/icons/filter.svg"} />
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

export default ProjectDetails;
