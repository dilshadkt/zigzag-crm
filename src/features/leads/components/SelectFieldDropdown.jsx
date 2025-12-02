import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const SelectFieldDropdown = ({ value, options, onValueChange, disabled = false, column }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    const handleOptionSelect = (selectedOption) => {
        if (onValueChange && selectedOption) {
            onValueChange(selectedOption);
        }
        setIsOpen(false);
    };

    if (!options || options.length === 0) {
        // Fallback to plain text if no options available
        return <div className="text-[13px] text-slate-900">{value || "—"}</div>;
    }

    const displayValue = value || "—";

    return (
        <div
            className="relative inline-block"
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!disabled) {
                        setIsOpen(!isOpen);
                    }
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3f8cff]/20"
            >
                <span className="text-[13px] font-medium text-slate-700">
                    {displayValue}
                </span>
                {!disabled && (
                    <FiChevronDown
                        className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                        size={14}
                    />
                )}
            </button>

            {isOpen && !disabled && (
                <div
                    className="absolute left-0 top-full mt-2 z-50 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="max-h-60 overflow-auto">
                        {options.map((option, index) => {
                            const isSelected = option === value;

                            return (
                                <button
                                    key={`${option}-${index}`}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleOptionSelect(option);
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${isSelected
                                        ? "bg-[#3f8cff]/10 text-[#3f8cff] font-semibold"
                                        : "text-slate-700"
                                        }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectFieldDropdown;
