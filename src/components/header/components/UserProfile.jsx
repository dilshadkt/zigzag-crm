import React from "react";
import { Link } from "react-router-dom";

const UserProfile = ({ user }) => {
  return (
    <Link
      to={"/settings"}
      title={user?.firstName || "Profile"}
      className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] overflow-hidden bg-white shrink-0 relative block"
    >
      <img
        src={user?.profileImage}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </Link>
  );
};

export default UserProfile;
