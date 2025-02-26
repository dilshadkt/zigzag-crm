import clsx from "clsx";
import React, { useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";

const Input = ({
  title = "Title",
  placeholder = "Type here ...",
  type = "text",
  className,
  value,
  onchange,
  name,
  errors,
  touched,
  readOnly = false,
}) => {
  const [showPassword, setShowPassword] = useState(true);
  return (
    <div className={`flex relative flex-col gap-y-[7px] `}>
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="w-full relative ">
        <input
          readOnly={readOnly}
          name={name}
          value={value?.[name]}
          onChange={onchange}
          type={
            type === "password" ? (showPassword ? "password" : "text") : type
          }
          className={clsx(
            ` ${
              errors?.[name] && touched?.[name] && `border-red-400/50 `
            } rounded-[14px] text-sm  border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4
          outline-none focus:outline-none  w-full ${
            readOnly && "cursor-not-allowed opacity-60"
          }`,
            className
          )}
          placeholder={placeholder}
        />
        {errors?.[name] && touched?.[name] && (
          <span
            className="text-[10px] text-red-500 bg-white absolute whitespace-nowrap
               left-10 px-3 -bottom-[6px] w-fit mx-auto"
          >
            {errors?.[name]}
          </span>
        )}
      </div>

      {type === "password" && (
        <button
          type="button"
          className="absolute top-[46px] text-gray-500 cursor-pointer right-4 transform text-lg -translate-y-1/2"
        >
          {showPassword ? (
            <IoEyeOffOutline onClick={() => setShowPassword(false)} />
          ) : (
            <IoEyeOutline onClick={() => setShowPassword(true)} />
          )}
        </button>
      )}
    </div>
  );
};

export default Input;
