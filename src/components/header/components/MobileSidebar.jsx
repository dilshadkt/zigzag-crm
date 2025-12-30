import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import logo from "../../../assets/icons/logo.svg";

const MobileSidebar = ({
  isOpen,
  onClose,
  filteredSidebar,
  user,
  onLogout,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="bg-[#2155A3]/15 fixed w-full h-screen flex p-2 flex-col inset-0 m-auto z-[1000]"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white w-[220px] overflow-hidden flex flex-col justify-between rounded-3xl h-dvh p-3"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <img src={logo} alt="" className="w-10" />
          {/* Menu Items */}
          <ul className="flex flex-col  h-full
           overflow-y-auto gap-y-1 mt-5 text-[#7D8592]">
            {filteredSidebar.length > 0 ? (
              filteredSidebar.map((item, index) => (
                <li
                  key={index}
                  onClick={(e) => {
                    onClose();
                    navigate(item.path);
                  }}
                  className={`relative cursor-pointer px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${pathname === item.path && `bg-[#ECF3FF] text-[#3F8CFF]`
                    }`}
                >
                  <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
                  <span className="group-hover:text-[#3F8CFF] group-hover:translate-x-1 transition-all duration-300 text-sm">
                    {item.title}
                  </span>
                  <span className="absolute hidden group-hover:block -right-2.5 h-full w-1 bg-[#3F8CFF]"></span>
                </li>
              ))
            ) : (
              <li className="px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] text-[#7D8592] text-[13px]">
                <span>No accessible menu items</span>
              </li>
            )}
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="relative text-[#7D8592] cursor-pointer px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] font-semibold group"
        >
          <IoLogOutOutline className="text-lg group-hover:text-[#3F8CFF]" />
          <span className="group-hover:text-[#3F8CFF] group-hover:translate-x-1 transition-all duration-300 text-sm">
            Logout
          </span>
          <span className="absolute hidden group-hover:block -right-2.5 h-full w-1 bg-[#3F8CFF]"></span>
        </button>
      </div>
    </div>
  );
};

export default MobileSidebar;
