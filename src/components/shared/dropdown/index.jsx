import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options?.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-x-2 bg-[#E6EDF5] rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:border-[#3F8CFF] transition-colors"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IoIosArrowDown
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#E6EDF5] rounded-lg shadow-lg max-h-60 overflow-auto">
          <button
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F9FD] cursor-pointer transition-colors ${
              !value ? "bg-[#F4F9FD] text-[#3F8CFF]" : "text-gray-700"
            }`}
          >
            {placeholder}
          </button>
          {options?.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F9FD] cursor-pointer transition-colors ${
                value === option.value
                  ? "bg-[#F4F9FD] text-[#3F8CFF]"
                  : "text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
