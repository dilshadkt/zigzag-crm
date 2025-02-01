import React from "react";

const UserProfile = ({ user }) => {
  return (
    <div className="flexStart gap-x-3">
      <div className="w-12 h-12 rounded-full overflow-hidden">
        <img
          src={`/image/dummy/${user?.profile}`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{user?.name}</span>
        <span className="text-sm text-[#91929E]">{user?.email}</span>
      </div>
    </div>
  );
};

export default UserProfile;
