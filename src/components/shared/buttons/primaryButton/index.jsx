import React from "react";
import clsx from "clsx";

const PrimaryButton = ({ className, icon, title }) => {
  return (
    <button
      className={clsx(
        `flexCenter h-10 px-3  gap-x-2 cursor-pointer  bg-[#3F8CFF] text-white  rounded-xl `,
        className
      )}
    >
      {icon && <img src={icon} alt="" className="w-5" />}
      {title && <span>{title}</span>}
    </button>
  );
};

export default PrimaryButton;
