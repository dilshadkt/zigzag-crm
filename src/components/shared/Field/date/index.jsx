import React, { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import clsx from "clsx";

const DatePicker = ({
  title = "Select Date",
  placeholder = "MM/DD/YYYY",
  className,
  value,
  onChange,
  name,
  errors,
  touched,
  readOnly = false,
  disabled,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || "");
  const menuRef = useRef();

  // Update selected date when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
    }
  }, [value]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!menuRef?.current?.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleCloseMenu);
    return () => {
      document.removeEventListener("mousedown", handleCloseMenu);
    };
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Handle date selection
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (onChange) {
      onChange({ target: { name, value: newDate } }); // Mimic event object for Formik
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="relative">
        <div
          onClick={() => !readOnly && !disabled && setIsMenuOpen(!isMenuOpen)}
          className={clsx(
            `rounded-[14px] text-sm border-2 text-[#7D8592] w-full border-[#D8E0F0]/80 py-[10px] px-4
            outline-none focus:outline-none relative  ${
              (readOnly || disabled) ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`,
            className,
            {
              "border-red-400/50": errors?.[name] && touched?.[name],
            }
          )}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
          <MdKeyboardArrowDown className="text-[#7D8592] text-lg absolute top-0 bottom-0 my-auto right-4" />
        </div>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute w-full rounded-2xl bg-white border-2 border-[#D8E0F0]/80 shadow-sm
            left-0 right-0 mt-2 p-4 z-40"
          >
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full rounded-lg text-sm border border-[#D8E0F0] py-2 px-3
              outline-none focus:outline-none focus:border-blue-400"
            />
          </div>
        )}
        {errors?.[name] && touched?.[name] && (
          <span
            className="text-[10px] text-red-500 bg-white whitespace-nowrap
          left-10 px-3 w-fit mx-auto absolute -bottom-2"
          >
            {errors?.[name]}
          </span>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
