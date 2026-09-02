import React from "react";
import { FiCalendar } from "react-icons/fi";
import clsx from "clsx";

const toDateValue = (value) => {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DatePicker = ({
  title = "Select Date",
  placeholder = "Select date",
  className,
  value,
  onChange,
  name,
  errors,
  touched,
  readOnly = false,
  disabled,
}) => {
  const dateValue = toDateValue(value);

  const handleDateChange = (e) => {
    if (onChange) {
      onChange({ target: { name, value: e.target.value || "" } });
    }
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      {title ? (
        <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
          {title}
        </label>
      ) : null}
      <div className="relative">
        <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8592]" />
        <input
          type="date"
          name={name}
          value={dateValue}
          onChange={handleDateChange}
          disabled={disabled || readOnly}
          placeholder={placeholder}
          className={clsx(
            "w-full rounded-[14px] border-2 border-[#D8E0F0]/80 py-[10px] pl-10 pr-3 text-sm text-[#7D8592] outline-none focus:border-blue-400",
            className,
            {
              "border-red-400/50": errors?.[name] && touched?.[name],
              "cursor-not-allowed opacity-60": readOnly || disabled,
              "cursor-pointer": !readOnly && !disabled,
            }
          )}
        />
        {errors?.[name] && touched?.[name] && (
          <span className="absolute -bottom-2 left-10 mx-auto w-fit whitespace-nowrap bg-white px-3 text-[10px] text-red-500">
            {errors[name]}
          </span>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
