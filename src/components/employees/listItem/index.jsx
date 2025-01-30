import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import UserProfile from "../../shared/profile";

const ListItem = () => {
  return (
    <div className=" rounded-3xl bg-white py-5 px-7 grid grid-cols-3">
      <UserProfile />
      <div className="grid grid-cols-3">
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Gender</h5>
          <span>Male</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Birthday</h5>
          <span>Apr 12, 1995</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Full age</h5>
          <span>25</span>
        </div>
      </div>
      <div className="flexBetween">
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Gender</h5>
          <div className="flexStart gap-x-1">
            <span>UI/UX Designer</span>
            <span className="text-xs border mt-1 text-[#7D8592] border-[#7D8592]/50 px-1 rounded-md">
              Middle
            </span>
          </div>
        </div>
        <PrimaryButton className={"bg-[#F4F9FD]"} icon={"/icons/dot.svg"} />
      </div>
    </div>
  );
};

export default ListItem;
