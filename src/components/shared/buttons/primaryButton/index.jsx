import React from "react";
import clsx from "clsx";

const PrimaryButton = ({
  className = "text-white",
  icon,
  title,
  onclick,
  type = "button",
  iconPosition = "left",
}) => {
  return (
    <button
      type={type}
      onClick={onclick}
      className={clsx(
        `flexCenter ${
          iconPosition === "left" ? `` : `flex-row-reverse`
        } h-10 px-3  gap-x-2 cursor-pointer  bg-[#3F8CFF]   rounded-xl `,
        className
      )}
    >
      {icon && <img src={icon} alt="" className="w-5" />}
      {title && <span>{title}</span>}
    </button>
  );
};

export default PrimaryButton;
