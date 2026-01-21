import React from "react";
import { Link } from "react-router-dom";

const UserProfile = ({ user }) => {
  return (
    <div className="h-12 rounded-[14px] gap-x-2 px-3 w-fit bg-white flexCenter">
      <div className="w-[30px] aspect-square rounded-full overflow-hidden bg-white">
        <img
          src={user?.profileImage}
          alt=""
          className="w-full h-full object-cover scale-90"
        />
      </div>
      <Link
        to={"/settings"}
        className="hidden lg:flexStart gap-x-3.5 cursor-pointer"
      >
        <span className="text-sm font-medium">{user?.firstName}</span>
        <img src="/icons/arrowDown.svg" alt="" className="w-5" />
      </Link>
    </div>
  );
};

export default UserProfile;
