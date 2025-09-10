import React from "react";
import AttendanceHeader from "./components/AttendanceHeader";
import SummaryCards from "./components/SummaryCards";
import SearchAndFilters from "./components/SearchAndFilters";
import AttendanceTable from "./components/AttendanceTable";

const Attendance = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AttendanceHeader />
      <SummaryCards />
      <SearchAndFilters />
      <AttendanceTable />
    </div>
  );
};

export default Attendance;
