import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const menuRef = useRef();
  const searchInputRef = useRef();

  const getItemValue = (item) =>
    typeof item === "object" && item !== null ? item.value : item;
  const getItemLabel = (item) =>
    typeof item === "object" && item !== null ? item.label : item;

  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((item) => {
      const label = getItemLabel(item) || getItemValue(item) || "";
      return String(label).toLowerCase().includes(term);
    });
  }, [options, searchTerm]);

  // Update selected value when `value` prop changes
  useEffect(() => {
    if (value !== undefined && value !== "") {
      // Find the label for the current value
      const found = options?.find((item) => getItemValue(item) === value);
      setSelected(found ? getItemLabel(found) : value);
    } else if (value === "" || value === null || value === undefined) {
      // Reset to placeholder when value is empty
      setSelected(placeholder || `Select ${title}`);
    }
  }, [value, options, placeholder, title]);

  // Focus search when menu opens
  useEffect(() => {
    if (isMenuOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isMenuOpen, filteredOptions]);

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
    const selectedValue = getItemValue(item);
    const displayValue = getItemLabel(item) || selectedValue;

    setSelected(displayValue);
    if (onChange) {
      onChange({ target: { name, value: selectedValue } }); // Mimic event object for Formik
    }
    setIsMenuOpen(false);
    setSearchTerm("");
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

  const handleKeyDown = (e) => {
    if (!isMenuOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsMenuOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length === 0 ? 0 : (prev + 1) % filteredOptions.length
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length === 0
          ? 0
          : (prev - 1 + filteredOptions.length) % filteredOptions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredOptions[highlightedIndex];
      if (item !== undefined) {
        handleSelect(item);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
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
           left-0 right-0 mt-5 py-2 z-40 max-h-60 overflow-y-auto"
          >
            <li className="px-3 pb-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </li>
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">No options</li>
            )}
            {filteredOptions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={clsx(
                  "px-4 py-2 capitalize cursor-pointer",
                  highlightedIndex === index
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-blue-50"
                )}
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
