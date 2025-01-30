import React, { useState } from "react";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import Header from "../../components/shared/header";
import UserProfile from "../../components/shared/profile";
import { IoArrowUpOutline } from "react-icons/io5";

const Vacations = () => {
  const [stat, setStat] = useState("Employees’ vacations");
  const renderStat = () => {
    if (stat === "Employees’ vacations") {
      return (
        <div className="flex flex-col overflow-y-auto gap-y-3 mt-3">
          {new Array(10).fill(" ").map((item, index) => (
            <div
              key={index}
              className=" rounded-3xl bg-white py-5 px-7 grid grid-cols-2"
            >
              <UserProfile />
              <div className="grid grid-cols-3">
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Vacations</h5>
                  <span>10</span>
                </div>
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Sick Leave</h5>
                  <span>6</span>
                </div>
                <div className="flex flex-col gap-y-1">
                  <h5 className="text-sm text-[#91929E]">Work remotely</h5>
                  <span>34</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex flex-col  mt-3 overflow-hidden  bg-white rounded-3xl">
          <div className="min-h-[88px]  w-full flex">
            <div className="min-w-[240px] border-b border-r border-[#E6EBF5] h-full flexCenter">
              <div className="flexBetween w-full pl-6 pr-4">
                <h4 className="font-medium">Employees</h4>
                <PrimaryButton
                  icon={"/icons/search.svg"}
                  className={"bg-[#F4F9FD]"}
                />
              </div>
            </div>
            <div className="w-full border-b border-[#E6EBF5] flex flex-col">
              <div className="w-full h-full flexCenter relative">
                <span className="font-medium ">First month (September)</span>
                <div className="flexStart gap-x-2 absolute right-6 top-0 bottom-0 my-auto">
                  <button>
                    <IoArrowUpOutline className="-rotate-90 cursor-pointer text-xl text-[#C9CCD1]" />
                  </button>
                  <button>
                    <IoArrowUpOutline className="rotate-90 cursor-pointer text-xl text-[#3F8CFF]" />
                  </button>
                </div>
              </div>
              <div className="h-full gap-x-1 grid grid-cols-31  overflow-x-auto flexStart m-1">
                {new Array(31).fill(" ").map((item, index) => (
                  <div
                    key={index}
                    className="w-full min-w-[28px] h-10  rounded-[7px] bg-[#F4F9FD] flexCenter flex-col"
                  >
                    <span className="text-[13px] font-medium text-[#7D8593]">
                      {index + 1}
                    </span>
                    <span className="text-[11px] text-[#7D8594] -translate-y-1">
                      Tue
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full border-b overflow-y-auto flexStart border-[#E6EBF5] h-full">
            <div className="w-full h-full overflow-y-auto">
              {new Array(8).fill(" ").map((item, index) => (
                <div className="flex w-full">
                  <div
                    key={index}
                    className="min-h-[52px] min-w-[240px] border-r   border-b border-[#E6EBF5] flexStart gap-x-[10px]
    px-6"
                  >
                    <div className="w-6 h-6 overflow-hidden rounded-full flexCenter">
                      <img
                        src="/image/photo.png"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Oscar Holloway</span>
                  </div>
                  <div className="w-full h-[52px] border-b border-[#E6EBF5]  gap-x-1 grid grid-cols-31  flexStart px-1">
                    {new Array(31).fill(" ").map((item, index) => (
                      <div
                        key={index}
                        className=" min-w-[28px] w-full h-10  rounded-[7px] bg-[#F4F9FD] flexCenter flex-col"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-[75px] w-full   flexStart ">
            <div className="min-w-[240px] h-full border-r   border-[#E6EBF5]"></div>
            <div className="w-full h-full px-7  flexCenter">
              <div className=" w-full grid grid-cols-3">
                <div className="flex flex-col gap-y-1">
                  <span className="text-sm text-[#7D8592] font-medium">
                    Sick Leave
                  </span>
                  <div className="flexStart gap-x-2">
                    <div className="w-[10px] h-[10px] rounded-full bg-red-400"></div>
                    <span>Approved</span>
                    <div className="w-[10px] ml-5 h-[10px] rounded-full border-2 border-red-400 bg-red-400/50"></div>
                    <span>Pending</span>
                  </div>
                </div>
                <div className="flexCenter">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#7D8592] font-medium">
                      Work remotely
                    </span>
                    <div className="flexStart gap-x-2">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#6D5DD3]"></div>
                      <span>Approved</span>
                      <div className="w-[10px] ml-5 h-[10px] rounded-full border-2 border-[#6D5DD3] bg-[#6D5DD3]/50"></div>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
                <div className="flexEnd">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#7D8592] font-medium">
                      Vacation
                    </span>
                    <div className="flexStart gap-x-2">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#15C0E6]"></div>
                      <span>Approved</span>
                      <div className="w-[10px] ml-5 h-[10px] rounded-full border-2 border-[#15C0E6] bg-[#15C0E6]/50"></div>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  return (
    <section className="flex flex-col h-full gap-y-3">
      {/* header  */}
      <div className="flexBetween ">
        <Header>Vacations</Header>
        <ButtonToggle
          setValue={setStat}
          value={stat}
          values={["Employees’ vacations", "Calendar"]}
        />
        <PrimaryButton
          icon={"/icons/add.svg"}
          title={"Add Request"}
          className={"mt-3 px-5"}
        />
      </div>
      {/* body part  */}
      {renderStat()}
      {/* calender  part  */}
    </section>
  );
};

export default Vacations;
