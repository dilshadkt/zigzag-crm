import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const Select = ({
  title = "Title",
  className,
  options,
  defaultValue = null,
}) => {
  const [selected, setSelected] = useState(defaultValue || options[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // TOGGLE MENU
  const menuRef = useRef();

  // CLOSE MENU WHILE CLICK OUTSIDE
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleCloseMenu);
    return () => {
      document.removeEventListener("mousedown", handleCloseMenu);
    };
  }, []);

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-medium text-[#7D8592]">
        {title}
      </label>
      <div
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={clsx(
          ` rounded-[14px] text-sm  border-2 text-[#7D8592] w-full border-[#D8E0F0]/80 py-[10px] px-4
            outline-none focus:outline-none  relative cursor-pointer`,
          className
        )}
      >
        {selected}
        <MdKeyboardArrowDown
          className="text-[#7D8592] text-lg 
        absolute top-0 bottom-0 my-auto right-4 "
        />
        {isMenuOpen && (
          <ul
            ref={menuRef}
            className="absolute w-full rounded-2xl bg-white border-2 border-[#D8E0F0]/80 shadow-sm
           left-0 right-0 mt-5 py-2 z-40"
          >
            {defaultValue && (
              <li className="px-4 py-2  cursor-none">{defaultValue}</li>
            )}
            {options.map((item, index) => (
              <li
                key={index}
                onClick={() => setSelected(item)}
                className="px-4 py-2 hover:bg-blue-50"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Select;
