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
        className={`h-9 w-full rounded-xl border border-slate-200 px-3 text-left text-[12px] font-bold text-slate-700 flex items-center justify-between focus:outline-none focus:border-[#3f8cff] transition-all bg-white ${
          disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
        }`}
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <FiChevronDown
          size={14}
          className={`transition-transform text-slate-400 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-48 overflow-auto py-1 animate-in fade-in zoom-in duration-100">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`w-full text-left px-3 py-1.5 text-[12px] font-medium hover:bg-slate-50 transition-colors ${
                option.value === value ? "text-[#3f8cff] font-bold bg-blue-50/50" : "text-slate-700"
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

