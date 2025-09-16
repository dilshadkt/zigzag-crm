/**
 * Advanced Excel Export Utility
 * Exports attendance data to proper Excel format (XLSX)
 * Note: This requires the 'xlsx' library to be installed
 * Install with: npm install xlsx
 */

// Uncomment the following line if you want to use proper Excel format
// import * as XLSX from 'xlsx';

/**
 * Export attendance data to Excel format (XLSX)
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} date - Date for the report
 */
export const exportAttendanceToXLSX = (attendanceData, date) => {
  // Uncomment this section if you want to use proper Excel format
  /*
  try {
    // Prepare data for Excel
    const excelData = prepareExcelData(attendanceData, date);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Employee Name
      { wch: 25 }, // Email
      { wch: 15 }, // Position
      { wch: 15 }, // Clock In Time
      { wch: 15 }, // Clock Out Time
      { wch: 12 }, // Total Hours
      { wch: 12 }, // Overtime Hours
      { wch: 12 }, // Status
      { wch: 30 }, // Location
      { wch: 30 }, // Work Description
      { wch: 10 }, // Is Late
      { wch: 15 }, // Late By
      { wch: 12 }, // Is Early Out
      { wch: 15 }, // Early Out By
      { wch: 15 }, // Approval Status
      { wch: 15 }  // Date
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    
    // Generate filename
    const filename = `attendance-report-${formatDateForFilename(date)}.xlsx`;
    
    // Write and download file
    XLSX.writeFile(wb, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel format');
  }
  */

  // Fallback to CSV if XLSX library is not available
  console.warn("XLSX library not available, falling back to CSV export");
  throw new Error(
    "XLSX export not available. Please install xlsx library or use CSV export."
  );
};

/**
 * Prepare data for Excel export
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} date - Date for the report
 * @returns {Array} Formatted data for Excel
 */
const prepareExcelData = (attendanceData, date) => {
  return attendanceData.map((record) => ({
    "Employee Name": `${record.employee?.firstName || ""} ${
      record.employee?.lastName || ""
    }`.trim(),
    Email: record.employee?.email || "",
    Position: record.employee?.position || "",
    "Clock In Time": formatTime(record.clockInTime),
    "Clock Out Time": formatTime(record.clockOutTime),
    "Total Hours": formatDuration(record.totalHours),
    "Overtime Hours": formatOvertime(record.overtimeHours),
    Status: record.status || "",
    Location: formatLocationForExport(record.clockInLocation),
    "Work Description": record.workDescription || record.adminNotes || "",
    "Is Late": record.isLate ? "Yes" : "No",
    "Late By (minutes)": record.lateBy || 0,
    "Is Early Out": record.isEarlyOut ? "Yes" : "No",
    "Early Out By (minutes)": record.earlyOutBy || 0,
    "Approval Status": record.approvalStatus || "pending",
    Date: formatDate(date),
  }));
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
