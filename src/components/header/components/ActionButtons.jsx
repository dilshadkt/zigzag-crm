import React from "react";
import { Link } from "react-router-dom";
import {
  IoDocumentTextOutline,
  IoTimeOutline,
  IoFingerPrintOutline,
} from "react-icons/io5";

const ActionButtons = ({
  isShiftActive,
  statusLoading,
  isClockingIn,
  onAttendanceClick,
  onNotifyClick,
  unreadCount,
  stickyNotesCount,
  remainingTime,
  isRunning,
  formatTime,
}) => {
  return (
    <>
      {/* Sticky Notes */}
      <Link
        to="/sticky-notes"
        className="hidden lg:flex items-center justify-center cursor-pointer w-12 h-12 rounded-[14px] bg-white relative"
      >
        <IoDocumentTextOutline className="w-5 h-5 text-gray-600" />
        {stickyNotesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {stickyNotesCount > 9 ? "9+" : stickyNotesCount}
          </span>
        )}
      </Link>

      {/* Clock In Button */}
      {!isShiftActive && (
        <button
          onClick={onAttendanceClick}
          className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white relative hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={statusLoading || isClockingIn}
        >
          {statusLoading ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <IoFingerPrintOutline className="w-5 h-5 text-gray-600" />
          )}
        </button>
      )}

      {/* Timer */}
      <Link
        to="/timer"
        className={`hidden lg:flex items-center justify-center cursor-pointer rounded-[14px] bg-white relative transition-all ${
          isRunning ? "px-3 h-12" : "w-12 h-12"
        }`}
      >
        {isRunning ? (
          <div className="flex items-center gap-2">
            <IoTimeOutline className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-mono font-medium text-blue-600">
              {formatTime(remainingTime)}
            </span>
          </div>
        ) : (
          <IoTimeOutline className="w-5 h-5 text-gray-600" />
        )}
        {isRunning && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        )}
      </Link>

      {/* Notifications */}
      <button
        onClick={onNotifyClick}
        className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white relative"
      >
        <img src={"/icons/alert.svg"} alt="" className="w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
};

export default ActionButtons;
