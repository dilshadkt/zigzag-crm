import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import UserProfile from "../../shared/profile";
const ListItem = ({ employee, onClick }) => {
  return (
    <div
      className=" rounded-3xl bg-white py-5 px-7 grid grid-cols-1 
      gap-y-5 md:gap-y-0 md:grid-cols-3 cursor-pointer"
      onClick={onClick}
    >
      <UserProfile
        user={{
          name: employee?.name,
          email: employee?.email,
          profile: employee?.profile,
        }}
      />
      <div className="grid grid-cols-3">
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Gender</h5>
          <span>{employee?.gender || "------"}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Birthday</h5>
          <span>{employee?.birthday || "-----"}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Full age</h5>
          <span>{employee?.full_age || "------"}</span>
        </div>
      </div>
      <div className="flexBetween">
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Position</h5>
          <div className="flexStart gap-x-1">
            <span>{employee?.position || "------"}</span>
            <span className="text-xs border mt-1 text-[#7D8592] border-[#7D8592]/50 px-1 rounded-md">
              {employee?.level || "------"}
            </span>
          </div>
        </div>
        <div className=" hidden md:block">
          <PrimaryButton className={"bg-[#F4F9FD]"} icon={"/icons/dot.svg"} />
        </div>
      </div>
    </div>
  );
};

export default ListItem;
