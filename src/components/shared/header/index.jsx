import React from "react";

const Header = ({ children, className }) => {
  return (
    <h3 className={`text-xl md:text-2xl font-bold  text-gray-800 ${className}`}>
      {children}
    </h3>
  );
};

export default Header;
