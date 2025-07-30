import React from "react";
import clsx from "clsx";

const Description = ({
  title = "Title",
  placeholder = "Type here ...",
  className,
  value,
  onChange,
  name,
  errors,
  touched,
  rows = 4,
  maxLength,
  disabled,
}) => {
  // Handle text change
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          rows={rows}
          maxLength={maxLength}
          className={clsx(
            `rounded-[14px] text-sm min-h-[100px] w-full border-2 text-[#7D8592] 
            border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none resize-none`,
            className,
            {
              "border-red-400/50": errors?.[name] && touched?.[name],
              "opacity-50 cursor-not-allowed": disabled,
            }
          )}
          placeholder={placeholder}
          disabled={disabled}
        />

        {maxLength && (
          <div className="absolute bottom-2 right-4 text-xs text-[#7D8592]">
            {value?.length || 0}/{maxLength}
          </div>
        )}
        {errors?.[name] && touched?.[name] && (
          <span
            className="text-[10px] absolute -bottom-0 text-red-500 bg-white whitespace-nowrap
          left-10 px-3 w-fit mx-auto"
          >
            {errors?.[name]}
          </span>
        )}
      </div>
    </div>
  );
};

export default Description;
