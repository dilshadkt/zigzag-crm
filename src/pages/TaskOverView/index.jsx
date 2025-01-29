import React from "react";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import { IoIosArrowDown } from "react-icons/io";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../components/shared/progress";

const TaskOverView = () => {
  return (
    <section className="col-span-4 overflow-hidden grid grid-cols-4   ">
      <div className="col-span-3  mr-5 flex flex-col">
        <div className="flexBetween">
          <h4 className="text-lg font-medium">Task Details</h4>
          <PrimaryButton className={"bg-white "} icon={"/icons/edit.svg"} />
        </div>
        <div className="flex flex-col h-full bg-white gap-y-1 rounded-3xl mt-5 p-6">
          <span className="text-sm text-[#91929E]">PN0001245</span>
          <div className="flexBetween">
            <h4 className="text-lg font-medium">UX Login + Registration</h4>
            <button
              className="text-xs font-medium 
              flexCenter gap-x-2 px-4 h-8 text-[#3F8CFF] bg-[#3F8CFF]/10
            cursor-pointer rounded-lg"
            >
              <span> In Progress</span>
              <IoIosArrowDown className="translate-y-0.5 " />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Think over UX for Login and Registration, create a flow using
            wireframes. Upon completion, show the team and discuss. Attach the
            source to the task.
          </p>
          <div className="flexStart gap-x-2 mt-3">
            <PrimaryButton
              icon={"/icons/file.svg"}
              className={"bg-[#6D5DD3]/10"}
            />
            <PrimaryButton
              icon={"/icons/link.svg"}
              className={"bg-[#15C0E6]/10"}
            />
          </div>
          <h5 className="font-medium mt-4">Task Attachments (3)</h5>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="h-36  relative rounded-xl bg-[#2155A3]/20 overflow-hidden">
              <img
                src="/image/dummy/upload.png"
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
              <div
                className="absolute left-0 right-0  flex rounded-xl bottom-0 py-2 px-3
               bg-white z-30 border border-gray-300 flex-col"
              >
                <span className="text-sm font-medium">site screens.png</span>
                <span className="text-xs text-[#91929E]">
                  Sep 19, 2020 | 10:52 AM
                </span>
              </div>
              <PrimaryButton
                icon={"/icons/file.svg"}
                className={"absolute top-1 right-1 z-40 bg-[#6D5DD3]/20"}
              />
            </div>
            <div className="h-36  relative rounded-xl bg-[#2155A3]/20 overflow-hidden">
              <img
                src="/image/dummy/upload.png"
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
              <div
                className="absolute left-0 right-0  flex rounded-xl bottom-0 py-2 px-3
               bg-white z-30 border border-gray-300 flex-col"
              >
                <span className="text-sm font-medium">site screens.png</span>
                <span className="text-xs text-[#91929E]">
                  Sep 19, 2020 | 10:52 AM
                </span>
              </div>
              <PrimaryButton
                icon={"/icons/file.svg"}
                className={"absolute top-1 right-1 z-40 bg-[#6D5DD3]/20"}
              />
            </div>
            <div className="h-36  relative rounded-xl bg-[#2155A3]/20 overflow-hidden">
              <img
                src="/image/dummy/upload.png"
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
              <div
                className="absolute left-0 right-0  flex rounded-xl bottom-0 py-2 px-3
               bg-white z-30 border border-gray-300 flex-col"
              >
                <span className="text-sm font-medium">site screens.png</span>
                <span className="text-xs text-[#91929E]">
                  Sep 19, 2020 | 10:52 AM
                </span>
              </div>
              <PrimaryButton
                icon={"/icons/file.svg"}
                className={"absolute top-1 right-1 z-40 bg-[#6D5DD3]/20"}
              />
            </div>
          </div>
        </div>
      </div>
      {/* task info  */}
      <div className="col-span-1 bg-white rounded-3xl px-2 justify-between  py-5 flex flex-col">
        <div>
          <div className="gap-y-3 flex flex-col mx-3">
            <h4 className="font-medium">Task Info</h4>
            <div className="flex flex-col  gap-y-2">
              <span className="text-sm text-[#91929E]">Reporter</span>
              <div className="flexStart gap-x-3">
                <div className="w-6 h-6  rounded-full overflow-hidden">
                  <img src="/image/photo.png" alt="" />
                </div>
                <span>Evan Yates</span>
              </div>
            </div>
            <div className="flex flex-col  gap-y-2">
              <span className="text-sm text-[#91929E]">Assigned</span>
              <div className="flexStart gap-x-3">
                <div className="w-6 h-6  rounded-full overflow-hidden">
                  <img src="/image/photo.png" alt="" />
                </div>
                <span>Evan Yates</span>
              </div>
            </div>
            <div className="flex flex-col  gap-y-2">
              <span className="text-sm text-[#91929E]">Priority</span>
              <div className="flexStart gap-x-1 text-[#FFBD21]">
                <IoArrowUpOutline className="text-xl " />
                <span className="text-sm">Medium</span>
              </div>
            </div>
          </div>

          <div className=" rounded-2xl mt-5 p-4 bg-[#F4F9FD]  flex flex-col">
            <h4 className="font-medium">Time tracking</h4>
            <div className="flexStart gap-x-3 my-3">
              <Progress size={33} strokeWidth={2} currentValue={43} />
              <div className="flex flex-col ">
                <span className="text-sm">1d 3h 25m logged</span>
                <span className="text-xs text-[#91929E] ">
                  Original Estimate 3d 8h
                </span>
              </div>
            </div>
            <PrimaryButton
              title={"Log time"}
              icon={"/icons/time.svg"}
              className={"w-fit "}
            />
          </div>
          <div className="gap-y-3 mt-1 flex flex-col mx-3">
            <div className="flex flex-col  gap-y-1">
              <span className="text-sm text-[#91929E]">Dead Line</span>
              <span className="text-sm text-[#0A1629]">Feb 23, 2020</span>
            </div>
          </div>
        </div>
        <div className="flexStart px-3">
          <img src="/icons/calender2.svg" alt="" className="w-4" />
          <span className="text-sm  text-[#7D8592]">Created May 28, 2020</span>
        </div>
      </div>
    </section>
  );
};

export default TaskOverView;
