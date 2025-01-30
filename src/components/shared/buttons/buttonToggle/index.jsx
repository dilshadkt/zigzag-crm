import React from "react";

const ButtonToggle = ({ values, value, setValue }) => {
  return (
    <div className="h-12 w-fit   mt-2 rounded-3xl grid grid-cols-2 p-1  bg-[#E6EDF5]">
      {values.map((item, index) => (
        <button
          key={index}
          onClick={() => setValue(`${item}`)}
          className={`h-full min-w-[180px] px-5 capitalize w-full cursor-pointer
         rounded-[20px]  ${
           value === item ? `bg-[#3F8CFF] text-white ` : `text-gray-800`
         } 
    flexCenter`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default ButtonToggle;
