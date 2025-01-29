import React from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import PrimaryButton from "../../shared/buttons/primaryButton";
const SelectedProject = () => {
  return (
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
          <p className="text-[#0A1629]/80 text-sm">
            App for maintaining your medical record, making appointments with a
            doctor, storing prescriptions
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
              <PrimaryButton
                icon={"/icons/file.svg"}
                className={"bg-[#6D5DD3]/10"}
              />
              <PrimaryButton
                icon={"/icons/link.svg"}
                className={"bg-[#15C0E6]/10"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedProject;
