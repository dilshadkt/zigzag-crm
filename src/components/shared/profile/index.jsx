import React from "react";

const UserProfile = () => {
  return (
    <div className="flexStart gap-x-3">
      <div className="w-12 h-12 rounded-full overflow-hidden">
        <img
          src="/image/photo.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-medium">Evan Yates</span>
        <span className="text-sm text-[#91929E]">evanyates@gmail.com</span>
      </div>
    </div>
  );
};

export default UserProfile;
