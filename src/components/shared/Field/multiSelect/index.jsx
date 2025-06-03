import React, { useState, useRef, useEffect } from "react";

const MultiSelect = ({
  title,
  name,
  value = [],
  onChange,
  options = [],
  placeholder = "Select options",
  errors,
  touched,
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    let newValue;
    if (value.includes(optionValue)) {
      // Remove if already selected
      newValue = value.filter((val) => val !== optionValue);
    } else {
      // Add if not selected
      newValue = [...value, optionValue];
    }

    // Call onChange with the event-like object
    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  // Remove selected option
  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter((val) => val !== optionValue);
    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  // Get label for selected value
  const getSelectedLabel = (val) => {
    const option = options.find((opt) => opt.value === val);
    return option ? option.label : val;
  };

  // Handle input click
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const hasError = errors && errors[name] && touched && touched[name];

  return (
    <div className="flex flex-col gap-y-1 relative" ref={dropdownRef}>
      {title && (
        <label className="text-sm font-medium text-gray-700">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`min-h-[44px] w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors duration-200 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        } ${
          hasError
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500"
        } ${isOpen ? "ring-1" : ""}`}
        onClick={handleInputClick}
      >
        <div className="flex flex-wrap gap-1 items-center min-h-[28px]">
          {value.length > 0 ? (
            value.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {getSelectedLabel(val)}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(val, e)}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}

          {/* Dropdown arrow */}
          <div className="ml-auto">
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 flex items-center justify-between ${
                      isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <span className="text-red-500 text-xs mt-1">{errors[name]}</span>
      )}
    </div>
  );
};

export default MultiSelect;
