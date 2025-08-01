import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const Select = ({
  title = "Title",
  className,
  options,
  defaultValue = null,
  value,
  onChange,
  name,
  errors,
  selectedValue,
  touched,
  disabled,
  placeholder,
}) => {
  const [selected, setSelected] = useState(() => {
    if (value) return value;
    if (defaultValue) return defaultValue;
    if (placeholder) return placeholder;
    return `Select ${title}`;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false); // TOGGLE MENU
  const menuRef = useRef();

  // Update selected value when `value` prop changes
  useEffect(() => {
    if (value !== undefined && value !== "") {
      // Find the label for the current value
      const found = options?.find(
        (item) =>
          (typeof item === "object" ? item.value : item) === value
      );
      setSelected(found ? (typeof found === "object" ? found.label : found) : value);
    } else if (value === "" || value === null || value === undefined) {
      // Reset to placeholder when value is empty
      setSelected(placeholder || `Select ${title}`);
    }
  }, [value, options, placeholder, title]);

  // CLOSE MENU WHILE CLICK OUTSIDE
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

  // Handle option selection
  const handleSelect = (item) => {
    const selectedValue = typeof item === "object" ? item.value : item;
    const displayValue = typeof item === "object" ? item.label : item;

    setSelected(displayValue);
    if (onChange) {
      onChange({ target: { name, value: selectedValue } }); // Mimic event object for Formik
    }
    setIsMenuOpen(false);
  };

  // Helper function to get display value
  const getDisplayValue = (item) => {
    if (typeof item === "object" && item !== null) {
      return item.label;
    }
    return item;
  };

  // Check if current selection is a placeholder
  const isPlaceholder =
    !value || value === "" || selected === (placeholder || `Select ${title}`);

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div
        onClick={() => !disabled && setIsMenuOpen(!isMenuOpen)}
        className={clsx(
          `rounded-[14px]  text-sm border-2 w-full border-[#D8E0F0]/80 py-[10px] px-4
          outline-none focus:outline-none relative cursor-pointer`,
          className,
          {
            "border-red-400/50": errors?.[name] && touched?.[name], // Add error border
            "opacity-50 cursor-not-allowed": disabled, // Add disabled styling
            "text-[#7D8592]": isPlaceholder, // Placeholder styling
            "text-gray-900": !isPlaceholder, // Selected value styling
          }
        )}
      >
        {selected}
        <MdKeyboardArrowDown className="text-[#7D8592] text-lg absolute top-0 bottom-0 my-auto right-4" />
        {isMenuOpen && (
          <ul
            ref={menuRef}
            className="absolute w-full rounded-2xl bg-white border-2 border-[#D8E0F0]/80 shadow-sm
           left-0 right-0 mt-5 py-2 z-40"
          >
            {options.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelect(item)}
                className="px-4 py-2 capitalize hover:bg-blue-50 cursor-pointer"
              >
                {getDisplayValue(item)}
              </li>
            ))}
          </ul>
        )}
        {errors?.[name] && touched?.[name] && (
          <span
            className="text-[10px] -bottom-2 absolute text-red-500 bg-white whitespace-nowrap
            left-10 px-3 w-fit mx-auto"
          >
            {errors?.[name]}
          </span>
        )}
      </div>
    </div>
  );
};

export default Select;
