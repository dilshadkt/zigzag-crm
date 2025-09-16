/**
 * Excel Export Utility
 * Exports attendance data to Excel format
 */

/**
 * Convert attendance data to Excel format and download
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} date - Date for the report
 */
export const exportAttendanceToExcel = (attendanceData, date) => {
  try {
    // Create CSV content
    const csvContent = generateCSVContent(attendanceData, date);

    // Create and download file
    downloadCSV(
      csvContent,
      `attendance-report-${formatDateForFilename(date)}.csv`
    );
  } catch (error) {
    console.error("Error exporting attendance data:", error);
    throw new Error("Failed to export attendance data");
  }
};

/**
 * Generate CSV content from attendance data
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} date - Date for the report
 * @returns {string} CSV content
 */
const generateCSVContent = (attendanceData, date) => {
  // CSV Headers
  const headers = [
    "Employee Name",
    "Email",
    "Position",
    "Clock In Time",
    "Clock Out Time",
    "Total Hours",
    "Overtime Hours",
    "Status",
    "Location",
    "Work Description",
    "Is Late",
    "Late By (minutes)",
    "Is Early Out",
    "Early Out By (minutes)",
    "Approval Status",
    "Date",
  ];

  // Convert data to CSV rows
  const rows = attendanceData.map((record) => {
    return [
      // Employee Name
      `"${record.employee?.firstName || ""} ${
        record.employee?.lastName || ""
      }"`,

      // Email
      `"${record.employee?.email || ""}"`,

      // Position
      `"${record.employee?.position || ""}"`,

      // Clock In Time
      `"${formatTime(record.clockInTime)}"`,

      // Clock Out Time
      `"${formatTime(record.clockOutTime)}"`,

      // Total Hours
      `"${formatDuration(record.totalHours)}"`,

      // Overtime Hours
      `"${formatOvertime(record.overtimeHours)}"`,

      // Status
      `"${record.status || ""}"`,

      // Location
      `"${formatLocationForExport(record.clockInLocation)}"`,

      // Work Description
      `"${record.workDescription || record.adminNotes || ""}"`,

      // Is Late
      `"${record.isLate ? "Yes" : "No"}"`,

      // Late By
      `"${record.lateBy || 0}"`,

      // Is Early Out
      `"${record.isEarlyOut ? "Yes" : "No"}"`,

      // Early Out By
      `"${record.earlyOutBy || 0}"`,

      // Approval Status
      `"${record.approvalStatus || "pending"}"`,

      // Date
      `"${formatDate(date)}"`,
    ];
  });

  // Combine headers and rows
  const csvRows = [headers.join(","), ...rows.map((row) => row.join(","))];

  return csvRows.join("\n");
};

/**
 * Download CSV file
 * @param {string} content - CSV content
 * @param {string} filename - Filename for download
 */
const downloadCSV = (content, filename) => {
  // Create blob
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Format time for export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
const formatTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format duration for export
 * @param {number} totalHours - Total hours worked
 * @returns {string} Formatted duration
 */
const formatDuration = (totalHours) => {
  if (!totalHours) return "-";
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Format overtime for export
 * @param {number} overtimeHours - Overtime hours
 * @returns {string} Formatted overtime
 */
const formatOvertime = (overtimeHours) => {
  if (!overtimeHours || overtimeHours <= 0) return "-";
  const hours = Math.floor(overtimeHours);
  const minutes = Math.round((overtimeHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Format location for export
 * @param {Object} location - Location object
 * @returns {string} Formatted location
 */
const formatLocationForExport = (location) => {
  if (!location) return "No location";

  if (location.address && location.address !== "Current Location") {
    return location.address;
  }

  if (location.latitude && location.longitude) {
    return `Coordinates: ${location.latitude.toFixed(
      6
    )}, ${location.longitude.toFixed(6)}`;
  }

  return "Location not available";
};

/**
 * Format date for export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date for filename
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date for filename
 */
const formatDateForFilename = (date) => {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
};

/**
 * Export attendance data with loading state
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} date - Date for the report
 * @param {Function} setLoading - Function to set loading state
 * @returns {Promise} Export promise
 */
export const exportAttendanceWithLoading = async (
  attendanceData,
  date,
  setLoading
) => {
  try {
    setLoading(true);

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    exportAttendanceToExcel(attendanceData, date);

    return true;
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};
