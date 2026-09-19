import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { assetPath } from "../../utils/assetPath";
import PrimaryButton from "../shared/buttons/primaryButton";

const SupportSection = ({ handleLogout }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col ">
      <div className="h-[95px] mt-3 justify-center  w-full flex items-end bg-[#F4F9FD] relative rounded-[24px] p-4">
        <button
          onClick={() => setMenuOpen(true)}
          className="flexCenter  
       gap-x-2 rounded-[14px] cursor-pointer bg-[#3F8CFF] text-white w-fit px-5 py-2
    text-sm font-medium"
        >
          <img src={assetPath("icons/chat.svg")} alt="" loading="lazy" className="w-4" />
          <span>Support</span>
        </button>
        <img
          src="/image/support.svg"
          alt=""
          loading="lazy"
          className="absolute w-22 -top-10"
        />
      </div>
      <button
        onClick={handleLogout}
        className="text-[#7D8592] mt-2 px-2 py-[10px] rounded-[10px]  
  flexStart gap-x-3.5 hover:text-[#3F8CFF] text-sm"
      >
        <TbLogout className="text-lg" />
        <span>Logout</span>
      </button>
      {/* support section  */}
      {isMenuOpen && (
        <div
          className="fixed left-0 right-0 top-0 
      bottom-0 m-auto bg-black/40 backdrop-blur-sm flexCenter z-[1000]"
        >
          <div className="max-w-lg bg-white w-full rounded-3xl p-7 px-9 flex flex-col">
            <div className="flexBetween">
              <h4 className="text-lg font-medium">Need some Help?</h4>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-11 h-11 flexCenter bg-[#F4F9FD] rounded-2xl"
              >
                <img
                  src={assetPath("icons/cancel.svg")}
                  alt=""
                  className="w-5"
                  loading="lazy"
                />
              </button>
            </div>
            <div className="mt-4">
              <img src="/image/support.png" alt="" loading="lazy" />
            </div>
            <p className="text-gray-600 mt-3">
              Describe your question and our specialists will answer you within
              24 hours.
            </p>
            <form
              action="
          "
              className="mt-4 flex flex-col gap-y-3"
            >
              <div className="flex flex-col gap-y-2">
                <span className="text-[#7D8592] font-medium text-sm">
                  Request Subject
                </span>
                <div className="p-3 border rounded-xl h-12 border-[#D8E0F0]"></div>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-[#7D8592] font-medium text-sm">
                  Description
                </span>
                <textarea
                  placeholder="Add some description of the request "
                  className="p-3 border rounded-xl h-28 text-sm border-[#D8E0F0]"
                />
              </div>
              <div className="flexEnd mt-2">
                <PrimaryButton title={"Send Request"} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportSection;
