import React, { useState } from "react";
import { toast } from "react-hot-toast";
import AttendanceHeader from "./components/AttendanceHeader";
import SummaryCards from "./components/SummaryCards";
import SearchAndFilters from "./components/SearchAndFilters";
import AttendanceTable from "./components/AttendanceTable";

const Attendance = () => {
  // State for selected date (default to today)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  // State for selected period
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // State for attendance data (will be passed from AttendanceTable)
  const [attendanceData, setAttendanceData] = useState([]);

  // Handle search change
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Handle export success
  const handleExportSuccess = (message) => {
    toast.success(message);
  };

  // Handle export error
  const handleExportError = (error) => {
    toast.error(error);
  };

  return (
    <div className=" bg-gray-50">
      <AttendanceHeader
        attendanceData={attendanceData}
        selectedDate={selectedDate}
        onExportSuccess={handleExportSuccess}
        onExportError={handleExportError}
      />
      {/* <SummaryCards
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
      /> */}
      <SearchAndFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSearchChange={handleSearchChange}
        onPeriodChange={handlePeriodChange}
      />
      <AttendanceTable
        selectedDate={selectedDate}
        searchTerm={searchTerm}
        selectedPeriod={selectedPeriod}
        onDataChange={setAttendanceData}
      />
    </div>
  );
};

export default Attendance;
