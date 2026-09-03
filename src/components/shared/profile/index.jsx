import React, { useState } from "react";

const UserProfile = ({ user }) => {
  const [imgError, setImgError] = useState(false);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="flexStart border-b md:border-none border-gray-200 pb-5 md:pb-0 gap-x-3">
      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
        {user?.profile && !imgError ? (
          <img
            src={user?.profile}
            alt={user?.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3F8CFF] text-white font-bold text-lg">
            {getInitial(user?.name)}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{user?.name}</span>
          {user?.isOnProbation && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              On probation
            </span>
          )}
        </div>
        <span className="text-sm text-[#91929E]">{user?.email}</span>
      </div>
    </div>
  );
};

export default UserProfile;

