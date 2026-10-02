import React, { useState } from "react";
import { personName } from "../utils";

const PersonBadge = ({ person, emptyLabel = "Unknown", size = "h-7 w-7" }) => {
  const [failed, setFailed] = useState(false);
  const name = person ? personName(person) : emptyLabel;
  const initial = (person?.firstName || person?.lastName || name || "?").charAt(0).toUpperCase();
  const showImage = Boolean(person?.profileImage) && !failed;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {showImage ? (
        <img
          src={person.profileImage}
          alt=""
          onError={() => setFailed(true)}
          className={`${size} shrink-0 rounded-full bg-slate-100 object-cover`}
        />
      ) : (
        <span
          className={`${size} flex shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600`}
        >
          {initial}
        </span>
      )}
      <span className="truncate font-semibold text-slate-700">{name}</span>
    </div>
  );
};

export default PersonBadge;
