import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoIosArrowDown } from "react-icons/io";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking inside the button/container, let the button's onClick handle it
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }
      
      // If clicking inside the portal dropdown, ignore
      const portalContent = document.getElementById("searchable-dropdown-portal");
      if (portalContent && portalContent.contains(event.target)) {
        return;
      }
      
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", () => setIsOpen(false), { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", () => setIsOpen(false));
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const selectedOption = options?.find((option) => option.value === value);

  const filteredOptions = options?.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between gap-x-2 bg-slate-50/50 hover:bg-white rounded-xl px-2 sm:px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 outline-none"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IoIosArrowDown
          className={`text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && createPortal(
        <div 
          id="searchable-dropdown-portal"
          className="absolute z-[9999] mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto scrollbar-hide py-1">
            <button
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                !value ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {placeholder}
            </button>
            {filteredOptions?.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                    value === option.value
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-xs text-slate-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SearchableDropdown;
