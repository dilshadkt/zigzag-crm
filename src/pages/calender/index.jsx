import React, { useState } from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { IoArrowUpOutline } from "react-icons/io5";
const Calender = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const formattedDate = (date) => format(new Date(date), "dd/MM/yyyy");

  const calendarDays = [
    ...daysInMonth.map((date) => ({
      day: format(date, "EEE"),
      date: format(date, "d"),
    })),
    ...Array(31 - daysInMonth.length).fill({ day: "", date: "" }),
  ];
  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>Calendar</Header>
        <PrimaryButton
          icon={"/icons/add.svg"}
          title={"Add Event"}
          className={"mt-3"}
        />
      </div>
      <div className="w-full h-full flex flex-col  mt-3 overflow-hidden  bg-white rounded-3xl">
        <div className="min-h-[72px] flexCenter  border-b border-[#E6EBF5]">
          <div className="flexCenter gap-x-8">
            <button onClick={handlePrevMonth}>
              <IoArrowUpOutline
                className="-rotate-90 cursor-pointer text-xl
                                 text-[#C9CCD1] hover:scale-75 hover:text-[#3F8CFF]"
              />
            </button>
            <span className="text-lg w-[200px]  flexCenter font-medium">
              {format(firstDay, "MMMM (yyyy)")}
            </span>
            <button onClick={handlePrevMonth}>
              <IoArrowUpOutline
                className="rotate-90 cursor-pointer text-xl
                                 text-[#C9CCD1] hover:scale-75 hover:text-[#3F8CFF]"
              />
            </button>
          </div>
        </div>
        <div className="w-full h-full  overflow-y-auto border-collapse grid grid-cols-5">
          {calendarDays.map((item, index) => (
            <div
              key={index}
              className={` h-[128px] border-collapse border-b ${
                [4, 9, 14, 19, 24, 29].includes(index) ? "" : "border-r"
              } border-[#E6EBF5] relative`}
            >
              <span className="text-sm absolute top-2 right-2 text-gray-800">
                {item?.date}
              </span>
              {item?.day && (
                <span
                  className="text-xs text-[#7D8592] 
              font-medium rounded-lg bg-[#F4F9FD] px-2 py-1 absolute top-2 left-2 "
                >
                  {item?.day}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Calender;
