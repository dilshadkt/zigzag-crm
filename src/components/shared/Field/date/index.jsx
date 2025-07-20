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
  const inputRef = useRef();

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
    // Ensure we have a valid date string in ISO format
    const formattedDate = newDate
      ? new Date(newDate).toISOString().split("T")[0]
      : "";
    setSelectedDate(formattedDate);
    if (onChange) {
      onChange({ target: { name, value: formattedDate } }); // Mimic event object for Formik
    }
    // Don't close the menu immediately to allow for month/year navigation
  };

  // Handle input click to prevent menu from closing
  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  // Handle input focus to prevent menu from closing
  const handleInputFocus = (e) => {
    e.stopPropagation();
  };

  // Handle input blur with delay to allow for navigation
  const handleInputBlur = (e) => {
    // Add a small delay to allow for month/year navigation clicks
    setTimeout(() => {
      if (!menuRef?.current?.contains(document.activeElement)) {
        setIsMenuOpen(false);
      }
    }, 100);
  };

  // Handle keydown events
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false);
    }
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
              readOnly || disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
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
            onKeyDown={handleKeyDown}
          >
            <input
              ref={inputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="w-full rounded-lg text-sm border border-[#D8E0F0] py-2 px-3
              outline-none focus:outline-none focus:border-blue-400"
            />
            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
              <span>Click arrows to navigate months/years</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Done
              </button>
            </div>
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
