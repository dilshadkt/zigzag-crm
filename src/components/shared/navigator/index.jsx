import React from "react";
import { useNavigate } from "react-router-dom";

const Navigator = ({ title }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleGoBack} className="flexStart gap-x-2">
      <img src="/icons/arrowBack.svg" alt="" className=" w-4 md:w-5 translate-y-0.4" />
      <span className="text-[#3F8CFF] text-sm">{title}</span>
    </button>
  );
};

export default Navigator;
