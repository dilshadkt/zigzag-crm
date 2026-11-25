import React from "react";
import { Link } from "react-router-dom";
import { FiAward, FiBookOpen, FiChevronDown, FiClipboard } from "react-icons/fi";
import logo from "../../../../assets/icons/logo.svg";
import StudentAvatar from "../StudentAvatar";

// Not flexCenter: that helper sets display:flex and would beat `hidden` / `lg:hidden`
const iconButton = "relative items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-[14px] bg-white text-gray-600 hover:text-[#3F8CFF] transition-colors";

/** Top bar: course switcher on the left, shortcuts and profile on the right. */
const PortalHeader = ({ student, enrollments, enrollment, onSelect, onMenu }) => {
  const pending = enrollment?.tasks?.pending || 0;
  const hasMany = enrollments.length > 1;

  return (
    <header className="flex items-center gap-2 w-full min-w-0 shrink-0">
      <button type="button" onClick={onMenu} className="flex lg:hidden shrink-0 items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white" aria-label="Open menu">
        <img src={logo} alt="" className="w-8 h-8" />
      </button>

      <div className="relative min-w-0 flex-1 sm:flex-none sm:w-[420px] h-11 sm:h-12 rounded-[14px] bg-white flex items-center gap-3 px-3 sm:px-4">
        <FiBookOpen className="shrink-0 text-[#3F8CFF] w-[18px] h-[18px]" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-sm font-bold text-[#0A1629] truncate">{enrollment?.course?.name || "No course yet"}</p>
          {enrollment?.batch?.name && <p className="text-[11px] text-[#91929E] truncate">{enrollment.batch.name}</p>}
        </div>
        {hasMany && (
          <>
            <FiChevronDown className="shrink-0 text-[#91929E]" />
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={enrollment?._id || ""}
              onChange={(e) => onSelect(e.target.value)}
              aria-label="Choose course"
            >
              {enrollments.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.course?.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Link to="/student/tasks" className={`${iconButton} hidden sm:flex`} title="Tasks to do" aria-label={`Tasks, ${pending} to do`}>
          <FiClipboard className="w-5 h-5" />
          {pending > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flexCenter font-medium">{pending > 9 ? "9+" : pending}</span>
          )}
        </Link>
        <Link to="/student/certificate" className={`${iconButton} hidden sm:flex`} title="Certificate" aria-label="Certificate">
          <FiAward className="w-5 h-5" />
          {enrollment?.certificate && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500" />}
        </Link>
        <Link to="/student/profile" className="flex items-center gap-2.5 h-11 sm:h-12 rounded-[14px] bg-white p-1.5 md:pr-4" title="My profile">
          <StudentAvatar student={student} className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] text-xs" />
          <span className="hidden md:block leading-tight max-w-[10rem]">
            <span className="block text-sm font-bold text-[#0A1629] truncate">{student.name}</span>
            <span className="block text-[11px] text-[#91929E]">{student.studentId}</span>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default PortalHeader;
