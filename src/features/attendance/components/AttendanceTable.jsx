import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useAttendanceData } from "../hooks/useAttendanceData";
import {
  getAddressFromCoordinates,
  getDetailedLocation,
} from "../../../utils/locationUtils";
import LocationModal from "../../../components/LocationModal";

// Memoized table header component
const TableHeader = React.memo(({ title, icon }) => {
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
});

// Memoized status badge component
const StatusBadge = React.memo(({ status }) => {
  const getStatusConfig = useCallback((status) => {
    switch (status) {
      case "checked-in":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Checked In",
        };
      case "break":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "On Break",
        };
      case "checked-out":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          label: "Checked Out",
        };
      case "absent":
        return { bg: "bg-red-100", text: "text-red-800", label: "Absent" };
      case "late":
        return { bg: "bg-orange-100", text: "text-orange-800", label: "Late" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: "Unknown" };
    }
  }, []);

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
});

// Memoized time display component
const TimeDisplay = React.memo(({ time, label, className = "" }) => {
  if (!time) return <span className={`text-gray-400 ${className}`}>--:--</span>;

  const formattedTime = useMemo(() => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [time]);

  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-900">{formattedTime}</div>
      {label && <div className="text-xs text-gray-500">{label}</div>}
    </div>
  );
});

// Memoized employee row component
const EmployeeRow = React.memo(({ attendance }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const employee = attendance.employee;

  // Memoized location handler
  const handleLocationClick = useCallback(async () => {
    if (
      !attendance.clockInLocation?.latitude ||
      !attendance.clockInLocation?.longitude
    )
      return;

    setIsLoadingLocation(true);
    try {
      const {
        latitude: lat,
        longitude: lng,
        address: existingAddress,
      } = attendance.clockInLocation;
      const address =
        existingAddress || (await getAddressFromCoordinates(lat, lng));
      const details = await getDetailedLocation(lat, lng);

      setLocationDetails({
        address,
        details,
        coordinates: { lat, lng },
      });
      setShowLocationModal(true);
    } catch (error) {
      console.error("Error fetching location details:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [attendance.clockInLocation]);

  // Memoized employee name
  const employeeName = useMemo(() => {
    return `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim();
  }, [employee?.firstName, employee?.lastName]);

  // Memoized total hours calculation
  const totalHours = useMemo(() => {
    if (!attendance.totalHours) return "0h 0m";
    const hours = Math.floor(attendance.totalHours);
    const minutes = Math.round((attendance.totalHours - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }, [attendance.totalHours]);

  // Memoized overtime calculation
  const overtimeHours = useMemo(() => {
    if (!attendance.overtimeHours || attendance.overtimeHours <= 0) return "0h";
    const hours = Math.floor(attendance.overtimeHours);
    const minutes = Math.round((attendance.overtimeHours - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }, [attendance.overtimeHours]);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Employee Info */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {employee?.profileImage ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={employee.profileImage}
                  alt={employeeName}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {employeeName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {employeeName}
              </div>
              <div className="text-sm text-gray-500">{employee?.email}</div>
            </div>
          </div>
        </td>

        {/* Clock In/Out Times */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            <TimeDisplay time={attendance.clockInTime} label="In" />
            <TimeDisplay time={attendance.clockOutTime} label="Out" />
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={attendance.status} />
        </td>

        {/* Total Hours */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {totalHours}
        </td>

        {/* Overtime */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {overtimeHours}
        </td>

        {/* Location */}
        <td className="px-6 py-4 whitespace-nowrap">
          {attendance.clockInLocation?.latitude &&
          attendance.clockInLocation?.longitude ? (
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {attendance.clockInLocation?.address ? (
                  <div>
                    <div className="text-xs text-gray-500 truncate max-w-32">
                      {attendance.clockInLocation.address}
                    </div>
                    <button
                      onClick={handleLocationClick}
                      disabled={isLoadingLocation}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                      {isLoadingLocation ? "Loading..." : "View Details"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLocationClick}
                    disabled={isLoadingLocation}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {isLoadingLocation ? "Loading..." : "View Location"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-gray-400 text-sm">No location</span>
            </div>
          )}
        </td>

        {/* Notes */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
          <div className="truncate">
            {attendance.workDescription || attendance.adminNotes || "No notes"}
          </div>
        </td>
      </tr>

      {/* Location Modal */}
      {showLocationModal && locationDetails && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          latitude={locationDetails.coordinates.lat}
          longitude={locationDetails.coordinates.lng}
        />
      )}
    </>
  );
});

// Loading component
const LoadingState = React.memo(() => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading attendance data...</span>
      </div>
    </div>
  </div>
));

// Error component
const ErrorState = React.memo(({ error }) => (
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
        <p className="text-sm text-gray-500 mt-1">{error?.message}</p>
      </div>
    </div>
  </div>
));

// Empty state component
const EmptyState = React.memo(({ searchTerm }) => (
  <div className="bg-white h-full shadow-sm rounded-lg overflow-hidden">
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
));

const AttendanceTable = ({
  selectedDate,
  searchTerm,
  selectedPeriod,
  onDataChange,
}) => {
  // Use the shared data hook
  const { attendanceRecords, isLoading, error } =
    useAttendanceData(selectedDate);

  // Get attendance records from the shared hook
  const allAttendanceRecords = attendanceRecords || [];

  // Filter records based on search term using useMemo to prevent unnecessary re-computations
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return allAttendanceRecords;

    const searchLower = searchTerm.toLowerCase();
    return allAttendanceRecords.filter((record) => {
      const employeeName = `${record.employee?.firstName || ""} ${
        record.employee?.lastName || ""
      }`.toLowerCase();
      const employeeEmail = record.employee?.email?.toLowerCase() || "";

      return (
        employeeName.includes(searchLower) ||
        employeeEmail.includes(searchLower)
      );
    });
  }, [allAttendanceRecords, searchTerm]);

  // Use ref to track previous data and prevent unnecessary updates
  const prevDataRef = useRef();

  // Pass filtered data to parent component for export
  useEffect(() => {
    if (onDataChange && filteredRecords) {
      // Only update if data has actually changed
      if (
        !prevDataRef.current ||
        prevDataRef.current.length !== filteredRecords.length ||
        prevDataRef.current !== filteredRecords
      ) {
        prevDataRef.current = filteredRecords;
        onDataChange(filteredRecords);
      }
    }
  }, [filteredRecords, onDataChange]);

  // Memoized table headers
  const tableHeaders = useMemo(
    () => [
      {
        title: "Employee Name",
        icon: (
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
        ),
      },
      {
        title: "Clock-in & Out",
        icon: (
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
        ),
      },
      {
        title: "Status",
        icon: (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        title: "Total Hours",
        icon: (
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
        ),
      },
      {
        title: "Overtime",
        icon: (
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      {
        title: "Location",
        icon: (
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
        ),
      },
      {
        title: "Note",
        icon: (
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
        ),
      },
    ],
    []
  );

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Show empty state
  if (!filteredRecords || filteredRecords.length === 0) {
    return <EmptyState searchTerm={searchTerm} />;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header, index) => (
                <TableHeader
                  key={index}
                  title={header.title}
                  icon={header.icon}
                />
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((attendance, index) => (
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

export default React.memo(AttendanceTable);
