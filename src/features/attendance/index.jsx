import React, { useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import AttendanceHeader from "./components/AttendanceHeader";
import SummaryCards from "./components/SummaryCards";
import SearchAndFilters from "./components/SearchAndFilters";
import AttendanceTable from "./components/AttendanceTable";
import { useAttendanceData } from "./hooks/useAttendanceData";

// Custom hook for managing attendance state
const useAttendanceState = () => {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [attendanceData, setAttendanceData] = useState([]);

  // Memoized handlers to prevent unnecessary re-renders
  const handlers = useMemo(
    () => ({
      handleSearchChange: (term) => {
        setSearchTerm(term);
      },
      handlePeriodChange: (period) => {
        setSelectedPeriod(period);
      },
      handleDateChange: (date) => {
        setSelectedDate(date);
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
    selectedDate,
    searchTerm,
    selectedPeriod,
    attendanceData,
    ...handlers,
  };
};

const Attendance = () => {
  const {
    selectedDate,
    searchTerm,
    selectedPeriod,
    attendanceData,
    handleSearchChange,
    handlePeriodChange,
    handleDateChange,
    handleDataChange,
    handleExportSuccess,
    handleExportError,
  } = useAttendanceState();

  // Get attendance data using the shared hook
  const { attendanceRecords, isLoading, error } =
    useAttendanceData(selectedDate);

  // Memoize the date navigation handlers
  const dateNavigationHandlers = useMemo(
    () => ({
      onPreviousDay: () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        handleDateChange(prevDate.toISOString().split("T")[0]);
      },
      onNextDay: () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        handleDateChange(nextDate.toISOString().split("T")[0]);
      },
    }),
    [selectedDate, handleDateChange]
  );

  return (
    <div className="bg-gray-50 h-full flex overflow-hidden flex-col">
      <div className="p-6 h-full flex flex-col">
        <AttendanceHeader
          attendanceData={attendanceRecords}
          selectedDate={selectedDate}
          onExportSuccess={handleExportSuccess}
          onExportError={handleExportError}
          onPreviousDay={dateNavigationHandlers.onPreviousDay}
          onNextDay={dateNavigationHandlers.onNextDay}
        />

        {/* <SummaryCards
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        /> */}

        <SearchAndFilters
          selectedDate={selectedDate}
          searchTerm={searchTerm}
          selectedPeriod={selectedPeriod}
          onDateChange={handleDateChange}
          onSearchChange={handleSearchChange}
          onPeriodChange={handlePeriodChange}
        />

        <AttendanceTable
          selectedDate={selectedDate}
          searchTerm={searchTerm}
          selectedPeriod={selectedPeriod}
          onDataChange={handleDataChange}
        />
      </div>
    </div>
  );
};

export default Attendance;
