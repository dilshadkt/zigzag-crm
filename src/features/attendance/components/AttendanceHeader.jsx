import React, { useState, useCallback, useMemo } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { RiFileList2Line } from "react-icons/ri";
import { exportAttendanceWithLoading } from "../../../utils/excelExport";

// Memoized navigation buttons
const NavigationButtons = React.memo(({ onPreviousDay, onNextDay }) => {
  return (
    <div className="flex items-center px-4 py-2">
      <button
        onClick={onPreviousDay}
        className="text-gray-600 bg-white p-2 rounded-lg border border-gray-200 hover:text-gray-800 hover:bg-gray-50 mr-2 cursor-pointer transition-colors"
        aria-label="Previous day"
      >
        <MdKeyboardArrowLeft />
      </button>
      <button
        onClick={onNextDay}
        className="text-gray-600 bg-white p-2 rounded-lg border border-gray-200 hover:text-gray-800 hover:bg-gray-50 cursor-pointer ml-2 transition-colors"
        aria-label="Next day"
      >
        <MdKeyboardArrowRight />
      </button>
    </div>
  );
});

// Memoized export button
const ExportButton = React.memo(({ isExporting, onExport, disabled }) => {
  return (
    <button
      onClick={onExport}
      disabled={disabled}
      className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          Exporting...
        </>
      ) : (
        <>
          <RiFileList2Line />
          Attendance Report
        </>
      )}
    </button>
  );
});

// Memoized add attendance button
const AddAttendanceButton = React.memo(({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#3f8cff] text-sm font-semibold cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      Add Attendance
    </button>
  );
});

const AttendanceHeader = ({
  attendanceData = [],
  selectedDate,
  onExportSuccess,
  onExportError,
  onPreviousDay,
  onNextDay,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Format date for display
  const formattedDate = useMemo(() => {
    if (!selectedDate) return "Select Date";
    const date = new Date(selectedDate);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  // Memoized export handler
  const handleExportReport = useCallback(async () => {
    if (!attendanceData || attendanceData.length === 0) {
      onExportError?.("No attendance data available to export");
      return;
    }

    try {
      await exportAttendanceWithLoading(
        attendanceData,
        selectedDate,
        setIsExporting
      );
      onExportSuccess?.("Attendance report exported successfully!");
    } catch (error) {
      onExportError?.(error.message || "Failed to export attendance report");
    }
  }, [attendanceData, selectedDate, onExportSuccess, onExportError]);

  // Memoized add attendance handler
  const handleAddAttendance = useCallback(() => {
    // TODO: Implement add attendance functionality
    console.log("Add attendance clicked");
  }, []);

  // Check if export is disabled
  const isExportDisabled = useMemo(() => {
    return !attendanceData || attendanceData.length === 0 || isExporting;
  }, [attendanceData, isExporting]);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Title and Navigation */}
      <div className="flex items-center gap-x-3">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <div className="flex items-center gap-x-2">
          <NavigationButtons
            onPreviousDay={onPreviousDay}
            onNextDay={onNextDay}
          />
          <span className="text-gray-800 text-[15px] font-semibold">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <ExportButton
          isExporting={isExporting}
          onExport={handleExportReport}
          disabled={isExportDisabled}
        />
        <AddAttendanceButton onClick={handleAddAttendance} />
      </div>
    </div>
  );
};

export default React.memo(AttendanceHeader);
