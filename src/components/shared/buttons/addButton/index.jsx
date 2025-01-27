import React from "react";
import clsx from "clsx";

const AddButton = ({ className }) => {
  return (
    <button
      className={clsx(
        `flexCenter h-11 px-6 gap-x-2 cursor-pointer  bg-[#3F8CFF] text-white  rounded-xl ${className}`,
        className
      )}
    >
      <img src="/icons/add.svg" alt="" className="w-5" />
      <span>Add Event</span>
    </button>
  );
};

export default AddButton;
