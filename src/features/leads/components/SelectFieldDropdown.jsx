import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const SelectFieldDropdown = ({ value, options, onValueChange, isPlaceholder = false, disabled = false, column }) => {
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

    // Handle exclusive dropdown: close others when this one opens
    useEffect(() => {
        const handleCloseOthers = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener("close-all-lead-dropdowns", handleCloseOthers);
        return () => window.removeEventListener("close-all-lead-dropdowns", handleCloseOthers);
    }, [isOpen]);

    const handleOptionSelect = (selectedOption) => {
        if (onValueChange && selectedOption) {
            onValueChange(selectedOption);
        }
        setIsOpen(false);
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!disabled) {
            const nextState = !isOpen;
            if (nextState) {
                // Dispatch event to close all other open dropdowns
                window.dispatchEvent(new CustomEvent("close-all-lead-dropdowns"));
            }
            setIsOpen(nextState);
        }
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
                onClick={toggleDropdown}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border transition-colors focus:outline-none focus:ring-2 focus:ring-[#3f8cff]/20 ${
                    isPlaceholder ? "border-dashed border-slate-300" : "border-slate-200 shadow-sm"
                }`}
            >
                <span className={`text-[13px] whitespace-nowrap font-medium ${
                    isPlaceholder ? "text-slate-400 italic" : "text-slate-700"
                }`}>
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
                    className="absolute left-0 top-full mt-2 z-50 min-w-[200px] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="max-h-60 overflow-y-auto flex flex-col">
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
