import React, { useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import AttendanceHeader from "./components/AttendanceHeader";
import SummaryCards from "./components/SummaryCards";
import AttendanceFilter, { getDateRanges } from "./components/AttendanceFilter";
import AttendanceTable from "./components/AttendanceTable";
import {
  useAttendanceData,
  useAttendanceDataRange,
} from "./hooks/useAttendanceData";

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

  return (
    <div className="bg-gray-50 h-full flex overflow-hidden flex-col">
      <div className=" h-full flex flex-col">
        <AttendanceHeader
          attendanceData={attendanceRecords}
          displayDate={displayDate}
          onExportSuccess={handleExportSuccess}
          onExportError={handleExportError}
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
        />
      </div>
    </div>
  );
};

export default Attendance;
