import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const Navigator = ({ title, to = -1 }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(to);
  };

  return (
    <button
      onClick={handleGoBack}
      className=" cursor-pointer  border border-gray-200 w-9 h-9
      rounded-md flex items-center  bg-white group
        justify-center gap-x-2"
    >
      <IoIosArrowBack className="group-hover:text-[#3f8cff] text-gray-400" />
      {/* <span className="text-[#3F8CFF] text-sm">{title}</span> */}
    </button>
  );
};

export default Navigator;
