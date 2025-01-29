import React from "react";

const PrimaryButton = ({ icon, className }) => {
  return (
    <button className={` flexCenter rounded-xl  w-11 h-10 ${className}`}>
      <img src={icon} alt="" className="w-5" />
    </button>
  );
};

export default PrimaryButton;
