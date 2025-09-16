import React, { useState, useEffect } from "react";
import { useDailyReport } from "../hooks/useAttendanceAnalytics";
import {
  getAddressFromCoordinates,
  getDetailedLocation,
} from "../../../utils/locationUtils";
import LocationModal from "../../../components/LocationModal";

const TableHeader = ({ title, icon }) => {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center gap-2">
        {icon}
        {title}
        <div className="flex flex-col">
          <svg
            className="w-3 h-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <svg
            className="w-3 h-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </th>
  );
};

const EmployeeRow = ({ attendance }) => {
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detailedLocation, setDetailedLocation] = useState(null);

  // Helper function to format time
  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format duration
  const formatDuration = (totalHours) => {
    if (!totalHours) return "-";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to format overtime
  const formatOvertime = (overtimeHours) => {
    if (!overtimeHours || overtimeHours <= 0) return "-";
    const hours = Math.floor(overtimeHours);
    const minutes = Math.round((overtimeHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to get employee initials
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0] : "";
    const last = lastName ? lastName[0] : "";
    return (first + last).toUpperCase();
  };

  // Helper function to get location display
  const getLocationDisplay = (location) => {
    if (!location) return "No location";

    // If we have detailed location data, use it for better formatting
    if (detailedLocation?.address) {
      const { city, state } = detailedLocation.address;
      if (city && state) {
        return `(${city}, ${state})`;
      }
    }

    // Use resolved address if available, otherwise use the stored address
    const address = resolvedAddress || location.address;

    if (!address) return "No location";

    // Try to extract city and state from the address string
    if (
      address &&
      address !== "Current Location" &&
      address !== "Address lookup failed"
    ) {
      // If it's a detailed address string, try to extract city and state
      const addressParts = address.split(",");
      if (addressParts.length >= 2) {
        // Get the last two parts (usually city, state)
        const city = addressParts[addressParts.length - 2]?.trim();
        const state = addressParts[addressParts.length - 1]?.trim();
        if (city && state) {
          return `(${city}, ${state})`;
        }
      }
    }

    // Fallback to truncated address
    return address.length > 20 ? address.substring(0, 20) + "..." : address;
  };

  // Effect to resolve address from coordinates if needed
  useEffect(() => {
    const resolveAddress = async () => {
      if (!attendance.clockInLocation) return;

      const { address } = attendance.clockInLocation;

      // If address is "Current Location" or similar, try to resolve it
      if (
        address === "Current Location" ||
        address === "Address lookup failed" ||
        !address
      ) {
        setIsLoadingAddress(true);
        try {
          // Get both simple address and detailed location
          const [resolvedAddr, detailedLoc] = await Promise.all([
            getAddressFromCoordinates(attendance.clockInLocation),
            getAddressFromCoordinates(attendance.clockInLocation, true),
          ]);
          setResolvedAddress(resolvedAddr);
          setDetailedLocation(detailedLoc);
        } catch (error) {
          console.warn("Failed to resolve address:", error);
          setResolvedAddress("Address lookup failed");
        } finally {
          setIsLoadingAddress(false);
        }
      } else {
        setResolvedAddress(address);
        // Still try to get detailed location for better city/state extraction
        try {
          const detailedLoc = await getAddressFromCoordinates(
            attendance.clockInLocation,
            true
          );
          setDetailedLocation(detailedLoc);
        } catch (error) {
          console.warn("Failed to get detailed location:", error);
        }
      }
    };

    resolveAddress();
  }, [attendance.clockInLocation]);

  return (
    <tr className="bg-white border-b border-gray-200 hover:bg-gray-50">
      {/* Employee Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {attendance.employee?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={attendance.employee.profileImage}
                alt={`${attendance.employee.firstName} ${attendance.employee.lastName}`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(
                  attendance.employee?.firstName,
                  attendance.employee?.lastName
                )}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {attendance.employee?.firstName} {attendance.employee?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {attendance.employee?.email}
            </div>
          </div>
        </div>
      </td>

      {/* Clock-in & Out */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-orange-600 font-medium">
            {formatTime(attendance.clockInTime)}
          </span>
          <div className="flex items-center">
            <div className="w-8 h-px bg-gray-300 relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <span className="text-gray-500 text-sm">
            {formatDuration(attendance.totalHours)}
          </span>
          <div className="flex items-center">
            <div className="w-8 h-px bg-gray-300 relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          <span className="text-orange-600 font-medium">
            {formatTime(attendance.clockOutTime)}
          </span>
        </div>
      </td>

      {/* Overtime */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatOvertime(attendance.overtimeHours)}
      </td>

      {/* Location */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          {isLoadingAddress ? (
            <div className="flex items-center gap-1 text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
              <span>Loading address...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Basic location display */}
              <div className="flex items-center gap-1 flex-1">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span
                  className="text-gray-700 truncate"
                  title={getLocationDisplay(attendance.clockInLocation)}
                >
                  {getLocationDisplay(attendance.clockInLocation)}
                </span>
              </div>

              {/* View details button */}
              {attendance.clockInLocation?.latitude &&
                attendance.clockInLocation?.longitude && (
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    title="View detailed location information"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Details
                  </button>
                )}
            </div>
          )}
        </div>
      </td>

      {/* Note */}
      <td className="px-6 py-4 text-sm text-gray-900">
        {attendance.workDescription || attendance.adminNotes || "-"}
      </td>

      {/* Location Modal */}
      {attendance.clockInLocation?.latitude &&
        attendance.clockInLocation?.longitude && (
          <LocationModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            latitude={attendance.clockInLocation.latitude}
            longitude={attendance.clockInLocation.longitude}
          />
        )}
    </tr>
  );
};

const AttendanceTable = ({
  selectedDate,
  searchTerm,
  selectedPeriod,
  onDataChange,
}) => {
  // Use the hook to fetch daily report data
  const { data, isLoading, error } = useDailyReport(selectedDate);

  // Get attendance records from the API response
  const allAttendanceRecords = data?.report || [];

  // Filter records based on search term
  const attendanceRecords = allAttendanceRecords.filter((record) => {
    if (!searchTerm) return true;

    const employeeName = `${record.employee?.firstName || ""} ${
      record.employee?.lastName || ""
    }`.toLowerCase();
    const employeeEmail = record.employee?.email?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      employeeName.includes(searchLower) || employeeEmail.includes(searchLower)
    );
  });

  // Pass filtered data to parent component for export
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange(attendanceRecords);
    }
  }, [attendanceRecords, onDataChange]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-gray-600">Failed to load attendance data</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              {searchTerm
                ? `No employees found matching "${searchTerm}"`
                : "No attendance records found"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No employees have clocked in for the selected date"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader
                title="Employee Name"
                icon={
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Clock-in & Out"
                icon={
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Overtime"
                icon={
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <TableHeader
                title="Location"
                icon={
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
              <TableHeader
                title="Note"
                icon={
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceRecords.map((attendance, index) => (
              <EmployeeRow
                key={attendance._id || index}
                attendance={attendance}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
