import React from "react";

const Header = ({ children, className }) => {
  return (
    <h3
      className={`text-2xl md:text-3xl font-bold mt-2 text-gray-800 ${className}`}
    >
      {children}
    </h3>
  );
};

export default Header;
