import React from "react";
import { Link } from "react-router-dom";

const Navigator = ({ path, title }) => {
  return (
    <Link to={path} className="flexStart gap-x-2">
      <img src="/icons/arrowBack.svg" alt="" className="w-5 translate-y-0.4" />
      <span className="text-[#3F8CFF] text-sm">{title}</span>
    </Link>
  );
};

export default Navigator;
