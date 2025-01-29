import React from "react";

const IconButton = ({ icon, className }) => {
  return (
    <button className={` flexCenter rounded-xl  w-11 h-11 ${className}`}>
      <img src={icon} alt="" className="w-5" />
    </button>
  );
};

export default IconButton;
