import React, { useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import AttendanceHeader from "./components/AttendanceHeader";
import SummaryCards from "./components/SummaryCards";
import AttendanceFilter, { getDateRanges } from "./components/AttendanceFilter";
import AttendanceTable from "./components/AttendanceTable";
import AttendanceCalendar from "./components/AttendanceCalendar";
import {
  useAttendanceData,
  useAttendanceDataRange,
} from "./hooks/useAttendanceData";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

// Custom hook for managing attendance state
const useAttendanceState = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50); // Items per page
  const [attendanceData, setAttendanceData] = useState([]);

  // Memoized handlers to prevent unnecessary re-renders
  const handlers = useMemo(
    () => ({
      handleSearchChange: (term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page on search
      },
      handleFilterChange: (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1); // Reset to first page on filter change
      },
      handleCustomDateChange: (startDate, endDate) => {
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
        setCurrentPage(1); // Reset to first page on date change
      },
      handlePageChange: (page) => {
        setCurrentPage(page);
      },
      handleDataChange: (data) => {
        setAttendanceData(data);
      },
      handleExportSuccess: (message) => {
        toast.success(message);
      },
      handleExportError: (error) => {
        toast.error(error);
      },
    }),
    []
  );

  return {
    searchTerm,
    selectedFilter,
    customStartDate,
    customEndDate,
    currentPage,
    pageLimit,
    attendanceData,
    ...handlers,
  };
};

const Attendance = () => {
  const { user, isCompany } = useAuth();
  const { hasPermission } = usePermissions();

  // Permission checks for attendance access
  const canViewAttendance = isCompany || hasPermission("attendance", "view");
  const canCreateAttendance =
    isCompany || hasPermission("attendance", "create");
  const canEditAttendance = isCompany || hasPermission("attendance", "edit");
  const canApproveAttendance =
    isCompany || hasPermission("attendance", "approve");
  const canDeleteAttendance =
    isCompany || hasPermission("attendance", "delete");

  // If user doesn't have view permission, show access denied message
  if (!canViewAttendance) {
    return (
      <div className="bg-gray-50 h-full flex overflow-hidden flex-col">
        <div className="h-full flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 m-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flexCenter mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have permission to view attendance data. Please
                contact your administrator to request access.
              </p>
              <div className="text-sm text-gray-500">
                Required permissions:{" "}
                <span className="font-medium">attendance.view</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    searchTerm,
    selectedFilter,
    customStartDate,
    customEndDate,
    currentPage,
    pageLimit,
    attendanceData,
    handleSearchChange,
    handleFilterChange,
    handleCustomDateChange,
    handlePageChange,
    handleDataChange,
    handleExportSuccess,
    handleExportError,
  } = useAttendanceState();

  // Calculate the actual date range based on selected filter
  const { actualStartDate, actualEndDate, isSingleDate } = useMemo(() => {
    if (selectedFilter === "custom") {
      return {
        actualStartDate: customStartDate,
        actualEndDate: customEndDate,
        isSingleDate: customStartDate === customEndDate,
      };
    }

    const ranges = getDateRanges();
    const range = ranges[selectedFilter] || ranges.today;
    return {
      actualStartDate: range.startDate,
      actualEndDate: range.endDate,
      isSingleDate: range.startDate === range.endDate,
    };
  }, [selectedFilter, customStartDate, customEndDate]);

  // Get attendance data using the appropriate hook with pagination
  const singleDateResult = useAttendanceData(
    isSingleDate ? actualStartDate : null,
    currentPage,
    pageLimit
  );
  const dateRangeResult = useAttendanceDataRange(
    !isSingleDate ? actualStartDate : null,
    !isSingleDate ? actualEndDate : null,
    currentPage,
    pageLimit
  );

  // Use the appropriate result based on query type
  const { attendanceRecords, isLoading, error, pagination } = isSingleDate
    ? singleDateResult
    : dateRangeResult;

  // Format date for display in header
  const displayDate = useMemo(() => {
    if (selectedFilter === "custom") {
      if (actualStartDate === actualEndDate) {
        return new Date(actualStartDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return `${new Date(actualStartDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${new Date(actualEndDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    const filterLabels = {
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
    };

    return filterLabels[selectedFilter] || "Today";
  }, [selectedFilter, actualStartDate, actualEndDate]);

  // Show calendar view only for users with view permission but NO management permissions
  // If user has edit, create, approve, or delete permission, they get admin view (table view)
  const hasManagementPermissions =
    canCreateAttendance ||
    canEditAttendance ||
    canApproveAttendance ||
    canDeleteAttendance;

  if (!hasManagementPermissions) {
    // View-only users see calendar view
    return (
      <div className="h-full flex overflow-hidden flex-col ">
        <div className="h-full flex flex-col">
          {/* Attendance Calendar */}
          <div className="flex-1 min-h-0">
            <AttendanceCalendar />
          </div>
        </div>
      </div>
    );
  }

  // Users with management permissions (edit, create, approve, delete) see admin view
  return (
    <div className="bg-gray-50 h-full flex overflow-hidden flex-col">
      <div className=" h-full flex flex-col">
        <AttendanceHeader
          attendanceData={attendanceRecords}
          displayDate={displayDate}
          onExportSuccess={handleExportSuccess}
          onExportError={handleExportError}
          canCreateAttendance={canCreateAttendance}
          canEditAttendance={canEditAttendance}
          canApproveAttendance={canApproveAttendance}
          canDeleteAttendance={canDeleteAttendance}
        />

        {/* <SummaryCards
          startDate={actualStartDate}
          endDate={actualEndDate}
        /> */}

        <AttendanceFilter
          searchTerm={searchTerm}
          selectedFilter={selectedFilter}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onCustomDateChange={handleCustomDateChange}
        />

        <AttendanceTable
          attendanceRecords={attendanceRecords}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDataChange={handleDataChange}
          canEditAttendance={canEditAttendance}
          canApproveAttendance={canApproveAttendance}
          canDeleteAttendance={canDeleteAttendance}
        />
      </div>
    </div>
  );
};

export default Attendance;
