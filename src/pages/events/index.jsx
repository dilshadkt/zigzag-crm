import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import { IoArrowUpOutline } from "react-icons/io5";

const Events = () => {
  return (
    <section className="flex flex-col">
      <Link to={"/"} className="flexStart gap-x-2">
        <img
          src="/icons/arrowBack.svg"
          alt=""
          className="w-5 translate-y-0.4"
        />
        <span className="text-[#3F8CFF] text-sm">Back to Dashboard</span>
      </Link>
      <div className="flexBetween ">
        <Header>Nearest Events</Header>
        <PrimaryButton className={"mt-3"} />
      </div>
      <div className="grid gap-4 grid-cols-2 mt-3">
        {new Array(6).fill(" ").map((item, index) => (
          <div
            key={index}
            className="p-6 pl-11 bg-white   rounded-3xl flexCenter"
          >
            <div className="flex flex-col relative gap-y-6 w-full h-full">
              <div className="flexBetween w-full">
                <div className="flexStart gap-x-2">
                  <img src="/icons/department.svg" alt="" />
                  <span className="text-[#0A1629] font-medium">
                    Presentation of the new department
                  </span>
                </div>
                <button>
                  <IoArrowUpOutline className="text-xl text-[#FFBD21]" />
                </button>
              </div>
              <div className="flexBetween w-full">
                <span className="text-[#91929E] text-sm  ">
                  Today | 6:00 PM{" "}
                </span>
                <div className="h-8 bg-[#F4F9FD] px-3 gap-x-1 text-[#7D8592] flexStart rounded-lg">
                  <img src="/icons/clock.svg" alt="" />
                  <span className="text-xs">4h</span>
                </div>
              </div>
              <div className="absolute -translate-x-5 w-1 h-full bg-red-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Events;
