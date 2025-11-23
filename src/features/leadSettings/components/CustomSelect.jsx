import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const CustomSelect = ({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`h-11 w-full rounded-2xl border border-slate-200 px-4 text-left text-sm font-medium text-slate-700 flex items-center justify-between focus:outline-none focus:border-[#3f8cff] ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <FiChevronDown
          className={`transition-transform text-slate-400 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                option.value === value ? "text-[#3f8cff] font-semibold" : "text-slate-700"
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

