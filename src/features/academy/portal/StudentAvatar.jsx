import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "./studentClient";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * The student's profile photo, or their initials. The photo is private, so it
 * is fetched with the portal token and shown from a blob URL.
 */
const StudentAvatar = ({ student, className = "w-9 h-9 rounded-[10px] text-xs" }) => {
  const { data: blob } = useQuery({
    // a new upload changes photoUpdatedAt, which fetches the new picture
    queryKey: ["student-portal", "photo", student.photoUpdatedAt],
    queryFn: studentApi.photo,
    enabled: Boolean(student.photoUpdatedAt),
    staleTime: Infinity,
    retry: 1,
  });
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob || !student.photoUpdatedAt) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob, student.photoUpdatedAt]);

  if (url) return <img src={url} alt={student.name} className={`object-cover shrink-0 ${className}`} />;
  return (
    <span className={`shrink-0 inline-flex items-center justify-center bg-gradient-to-br from-[#3F8CFF] to-[#6A5CFF] text-white font-bold ${className}`} aria-hidden="true">
      {initials(student.name)}
    </span>
  );
};

export default StudentAvatar;
