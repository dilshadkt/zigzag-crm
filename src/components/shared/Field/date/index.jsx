import clsx from "clsx";
import React from "react";

const DatePicker = ({
  title = "Select Date",
  placeholder = "MM/DD/YYYY",
  className,
}) => {
  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-medium text-[#7D8592]">
        {title}
      </label>
      <input
        type="date"
        className={clsx(
          `rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4
          outline-none focus:outline-none`,
          className
        )}
        placeholder={placeholder}
      />
    </div>
  );
};

export default DatePicker;
