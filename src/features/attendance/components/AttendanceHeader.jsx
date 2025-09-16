import React, { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { RiFileList2Line } from "react-icons/ri";
import { exportAttendanceWithLoading } from "../../../utils/excelExport";

const AttendanceHeader = ({
  attendanceData,
  selectedDate,
  onExportSuccess,
  onExportError,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
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
  };

  return (
    <div className="flex items-center justify-between mb-2">
      {/* Title */}
      <div className="flex items-center  gap-x-3">
        <h1 className="text-3xl font-bold text-gray-800">Attandance</h1>
        {/* Date Navigation */}
        <div className="flex items-center   px-4 py-2">
          <button
            className="text-gray-600 bg-white p-2 rounded-lg border
          border-gray-200 hover:text-gray-800 mr-2 cursor-pointer"
          >
            <MdKeyboardArrowLeft />
          </button>
          <span className="text-gray-800  text-[15px] font-semibold">
            Monday, 15 October
          </span>
          <button
            className="text-gray-600 bg-white p-2 rounded-lg border
          border-gray-200 hover:text-gray-800 cursor-pointer ml-2"
          >
            <MdKeyboardArrowRight />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportReport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-white border
         border-gray-200 text-gray-700 px-4 py-2 rounded-lg
        text-sm cursor-pointer font-semibold hover:bg-gray-50 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed"
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
        <button
          className="flex items-center gap-2 bg-[#3f8cff]
        text-sm font-semibold cursor-pointer
         text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
          Add Attandance
        </button>
      </div>
    </div>
  );
};

export default AttendanceHeader;
