import React, { useState } from "react";
import EndShiftModal from "./EndShiftModal";

const AttendanceStatus = ({
  isShiftActive,
  isOnBreak,
  shiftElapsedTime,
  isClockingOut,
  clockOutError,
  onEndShift,
}) => {
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);

  const formatShiftTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isShiftActive) return null;

  return (
    <>
      <div className="flex items-center bg-white rounded-[14px] px-3 h-12 gap-2 relative">
        <span className="text-xs font-medium text-gray-600">
          {isOnBreak ? "On Break" : "Active Shift"}
        </span>
        <span className="text-sm font-mono font-bold text-gray-800">
          {formatShiftTime(shiftElapsedTime)}
        </span>
        <button
          onClick={() => setShowEndShiftModal(true)}
          className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
          disabled={isClockingOut}
        >
          <span className="text-xs font-medium text-gray-600">
            {isClockingOut ? "Ending..." : "End Shift"}
          </span>
        </button>
        <div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
            isOnBreak ? "bg-yellow-500" : "bg-green-500"
          }`}
        ></div>
      </div>

      {/* End Shift Modal */}
      <EndShiftModal
        isOpen={showEndShiftModal}
        onClose={() => setShowEndShiftModal(false)}
        user={null} // We don't need user info for end shift
        isClockingOut={isClockingOut}
        clockOutError={clockOutError}
        onEndShift={onEndShift}
        shiftElapsedTime={shiftElapsedTime}
      />
    </>
  );
};

export default AttendanceStatus;
