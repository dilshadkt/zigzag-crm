import React, { useState, useEffect, useMemo, useRef } from "react";
import { attendanceApi } from "../../features/attendance/api/attendanceApi";
import { useEmpoyees } from "../../api/hooks";
import { FiClock, FiCalendar, FiCoffee, FiAlertCircle, FiDownload, FiSearch } from "react-icons/fi";

const HRDashboardPage = () => {
    // State for filtering
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return (d.getMonth() + 1).toString().padStart(2, "0");
    });
    const [selectedYear, setSelectedYear] = useState(() => {
        return new Date().getFullYear().toString();
    });
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
    const [staffSearch, setStaffSearch] = useState("");
    const staffDropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target)) {
                setIsStaffDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch employees for staff dropdown
    const { data: employeesData } = useEmpoyees(1, null);
    const employeesList = employeesData?.employees || [];

    // State for report data
    const [reportData, setReportData] = useState(null);
    const [todayHighlights, setTodayHighlights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get report data on mount or change of month, year, or employeeId
    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await attendanceApi.getStaffMonthlyReport(selectedMonth, selectedYear, selectedEmployeeId);
            if (res.success) {
                setReportData(res.report);
                setTodayHighlights(res.todayHighlights);
            } else {
                setError(res.message || "Failed to fetch staff report");
            }
        } catch (err) {
            console.error("Failed to fetch staff monthly report:", err);
            setError(err.response?.data?.message || err.message || "Error fetching report");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [selectedMonth, selectedYear, selectedEmployeeId]);

    // Handle export to CSV
    const handleExport = () => {
        if (!reportData) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Staff Name,Email,Position,Present Days,Leave Days,Total Worked Hours,Total Break Time (mins),Overtime (hrs),Late Arrivals\r\n";

        if (Array.isArray(reportData)) {
            reportData.forEach(row => {
                csvContent += `"${row.employee?.name}","${row.employee?.email}","${row.employee?.position || "N/A"}",${row.presentDays},${row.leaveDays},${row.totalWorkingHours},${row.totalBreakDuration},${row.totalOvertimeHours},${row.lateDaysCount}\r\n`;
            });
        } else if (reportData.employee) {
            csvContent += `"${reportData.employee.name}","${reportData.employee.email}","${reportData.employee.position || "N/A"}",${reportData.presentDays},${reportData.leaveDays},${reportData.totalWorkingHours},${reportData.totalBreakDuration},${reportData.totalOvertimeHours},${reportData.lateDaysCount}\r\n`;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_Report_${selectedYear}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate aggregated totals if multiple staff are viewed
    const totals = useMemo(() => {
        if (!reportData) return { presentDays: 0, leaveDays: 0, workingHours: 0, breakTime: 0, overtime: 0, lateCount: 0 };
        if (!Array.isArray(reportData)) {
            return {
                presentDays: reportData.presentDays || 0,
                leaveDays: reportData.leaveDays || 0,
                workingHours: reportData.totalWorkingHours || 0,
                breakTime: reportData.totalBreakDuration || 0,
                overtime: reportData.totalOvertimeHours || 0,
                lateCount: reportData.lateDaysCount || 0
            };
        }

        return reportData.reduce((acc, curr) => {
            acc.presentDays += curr.presentDays || 0;
            acc.leaveDays += curr.leaveDays || 0;
            acc.workingHours += curr.totalWorkingHours || 0;
            acc.breakTime += curr.totalBreakDuration || 0;
            acc.overtime += curr.totalOvertimeHours || 0;
            acc.lateCount += curr.lateDaysCount || 0;
            return acc;
        }, { presentDays: 0, leaveDays: 0, workingHours: 0, breakTime: 0, overtime: 0, lateCount: 0 });
    }, [reportData]);

    // Group the overtime data for display
    const overtimeList = useMemo(() => {
        if (!reportData) return [];
        if (!Array.isArray(reportData)) {
            return reportData.totalOvertimeHours > 0 ? [reportData] : [];
        }
        return reportData.filter(row => row.totalOvertimeHours > 0);
    }, [reportData]);

    return (
        <div className="flex flex-col gap-4 h-full  overflow-y-auto p-2 md:p-4">
            {/* Header section with minimal design */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">HR Attendance & Leave Dashboard</h2>
                    <p className="text-xs text-slate-500">Track and view Month-Based Staff Attendance metrics.</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={!reportData}
                    className="flex items-center gap-2 bg-[#0A1629] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer select-none"
                >
                    <FiDownload className="w-3.5 h-3.5" />
                    Export CSV
                </button>
            </div>

            {/* Filter and selector panel - compact, clean borders */}
            <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200/60 flex flex-wrap md:flex-nowrap gap-3 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full">
                    {/* Year Selector */}
                    <div className="flex flex-col gap-1 min-w-[100px]">
                        <label className="text-xs font-semibold text-slate-500 tracking-wider">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-slate-700 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-400 text-xs font-medium transition-all"
                        >
                            {[2024, 2025, 2026, 2027].map(yr => (
                                <option key={yr} value={yr} className="text-slate-900 bg-white">{yr}</option>
                            ))}
                        </select>
                    </div>

                    {/* Month Selector */}
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <label className="text-xs font-semibold text-slate-500 tracking-wider">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-slate-700 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-400 text-xs font-medium transition-all"
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const val = (i + 1).toString().padStart(2, "0");
                                const label = new Date(2026, i).toLocaleString("default", { month: "long" });
                                return <option key={val} value={val} className="text-slate-900 bg-white">{label}</option>;
                            })}
                        </select>
                    </div>

                    {/* Staff Autocomplete Filter */}
                    <div className="flex flex-col gap-1 min-w-[180px] flex-1 relative" ref={staffDropdownRef}>
                        <label className="text-xs font-semibold text-slate-500 tracking-wider">Select Staff Member</label>
                        <div
                            onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                            className="border border-slate-200 rounded-lg p-2 text-slate-700 bg-slate-50 focus:bg-white outline-none text-xs font-medium transition-all select-none flex items-center justify-between cursor-pointer min-h-[34px] hover:border-slate-300"
                        >
                            <span className="truncate">
                                {employeesList.find(emp => emp._id === selectedEmployeeId)?.name ||
                                    (employeesList.find(emp => emp._id === selectedEmployeeId) ?
                                        `${employeesList.find(emp => emp._id === selectedEmployeeId)?.firstName || ""} ${employeesList.find(emp => emp._id === selectedEmployeeId)?.lastName || ""}`.trim() :
                                        "All Staff Members")
                                }
                            </span>
                            <span className="text-[10px] text-gray-400">▼</span>
                        </div>

                        {isStaffDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200/60 rounded-xl p-2 z-50 flex flex-col gap-1.5 select-none animate-fadeIn max-h-64">
                                <div className="flex bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 items-center gap-2 shrink-0">
                                    <FiSearch className="text-slate-400 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="Search staff members..."
                                        className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder-slate-400 font-medium"
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-0.5">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEmployeeId("");
                                            setIsStaffDropdownOpen(false);
                                            setStaffSearch("");
                                        }}
                                        className={`flex items-center px-3 py-2 text-left text-xs font-bold rounded-lg transition-all ${selectedEmployeeId === ""
                                            ? "bg-blue-50 text-blue-600 font-bold"
                                            : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                    >
                                        All Staff Members
                                    </button>
                                    {employeesList
                                        .filter(emp => {
                                            const empName = (emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()).toLowerCase();
                                            return empName.includes(staffSearch.toLowerCase());
                                        })
                                        .map(emp => (
                                            <button
                                                key={emp._id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEmployeeId(emp._id);
                                                    setIsStaffDropdownOpen(false);
                                                    setStaffSearch("");
                                                }}
                                                className={`flex items-center px-3 py-2 text-left text-xs font-bold rounded-lg transition-all ${selectedEmployeeId === emp._id
                                                    ? "bg-blue-50 text-blue-600 font-bold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <span className="truncate">
                                                    {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Shimmer loader */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-slate-200/60" />
                    ))}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-medium flex items-center gap-2 text-xs">
                    <FiAlertCircle />
                    {error}
                </div>
            )}

            {/* Stat Cards Row - Compact design, no heavy shadows */}
            {!isLoading && !error && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col gap-1 transition-all">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-base">
                            <FiCalendar />
                        </div>
                        <span className="text-xs font-medium text-slate-400 tracking-wider mt-1">Present Days</span>
                        <h3 className="text-xl font-bold text-slate-800">{totals.presentDays}</h3>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col gap-1 transition-all">
                        <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-base">
                            <FiAlertCircle />
                        </div>
                        <span className="text-xs font-medium text-slate-400 tracking-wider mt-1">Leave Days</span>
                        <h3 className="text-xl font-bold text-slate-800">{totals.leaveDays}</h3>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col gap-1 transition-all">
                        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-base">
                            <FiClock />
                        </div>
                        <span className="text-xs font-medium text-slate-400 tracking-wider mt-1">Work Hours</span>
                        <h3 className="text-xl font-bold text-slate-800">{totals.workingHours.toFixed(1)}h</h3>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col gap-1 transition-all">
                        <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-base">
                            <FiCoffee />
                        </div>
                        <span className="text-xs font-medium text-slate-400 tracking-wider mt-1">Break Duration</span>
                        <h3 className="text-xl font-bold text-slate-800">{totals.breakTime}m</h3>
                    </div>

                    {/* Card 5 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col gap-1 transition-all">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-base">
                            <FiClock />
                        </div>
                        <span className="text-xs font-medium text-slate-400 tracking-wider mt-1">Late Arrivals</span>
                        <h3 className="text-xl font-bold text-slate-800">{totals.lateCount}</h3>
                    </div>
                </div>
            )}

            {/* COMBINED HIGHLIGHTS SECTION: 4-Column Grid with fixed height and scrollable panels */}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Col 1: Today's Leaves */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200/60 flex flex-col h-72 select-none">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <h5 className="font-bold text-slate-700 text-xs">Today's Leaves ({todayHighlights?.leaves?.length || 0})</h5>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 text-xs">
                            {todayHighlights?.leaves?.length > 0 ? (
                                todayHighlights.leaves.map((l, i) => (
                                    <div key={i} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100/60">
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{l.employeeName}</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 rounded-md border border-red-100 truncate">{l.type}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 font-medium text-xs py-1">No one on leave today.</p>
                            )}
                        </div>
                    </div>

                    {/* Col 2: Today's Late Check-ins */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200/60 flex flex-col h-72 select-none">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <h5 className="font-bold text-slate-700 text-xs">Today's Late Check-ins ({todayHighlights?.lateCheckins?.length || 0})</h5>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 text-xs">
                            {todayHighlights?.lateCheckins?.length > 0 ? (
                                todayHighlights.lateCheckins.map((lc, i) => (
                                    <div key={i} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100/60">
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{lc.employeeName}</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 rounded-md border border-amber-100">Late by {lc.lateBy}m</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 font-medium text-xs py-1">All arrived on time today.</p>
                            )}
                        </div>
                    </div>

                    {/* Col 3: Today's Early Checkouts */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200/60 flex flex-col h-72 select-none">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            <h5 className="font-bold text-slate-700 text-xs">Today's Early Checkouts ({todayHighlights?.earlyCheckouts?.length || 0})</h5>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 text-xs">
                            {todayHighlights?.earlyCheckouts?.length > 0 ? (
                                todayHighlights.earlyCheckouts.map((ec, i) => (
                                    <div key={i} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100/60">
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{ec.employeeName}</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-md border border-blue-100">Left early {ec.earlyOutBy}m</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 font-medium text-xs py-1">No early checkouts today.</p>
                            )}
                        </div>
                    </div>

                    {/* Col 4: Month's Overtime Breakdown */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200/60 flex flex-col h-72 select-none">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <h5 className="font-bold text-slate-700 text-xs">This Month's Overtime ({overtimeList.length} Staff)</h5>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 text-xs">
                            {overtimeList.length > 0 ? (
                                overtimeList.map((row, idx) => (
                                    <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100/60">
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{row.employee?.name}</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">{row.totalOvertimeHours} hrs</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 font-medium text-xs py-1">No overtime logged this month.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Table with clean design */}
            {!isLoading && !error && reportData && (
                <div className="bg-white min-h-[360px] rounded-xl border border-slate-200/60 overflow-hidden">
                    <div className="p-3 border-b border-slate-200/60 flex items-center justify-between bg-slate-50/50">
                        <h4 className="font-bold text-slate-700 text-sm">Monthly Report Details</h4>
                        <span className="text-xs text-slate-400">Total {Array.isArray(reportData) ? reportData.length : 1} Staff</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75">
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Staff Member</th>
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Present Days</th>
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Leave Days</th>
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Worked Hours</th>
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Break Duration</th>
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Overtime</th>
                                    <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500 tracking-wider">Late Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                                {Array.isArray(reportData) ? (
                                    reportData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{row.employee?.name}</span>
                                                    <span className="text-slate-400 text-xs">{row.employee?.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3.5 font-bold text-slate-800">{row.presentDays} days</td>
                                            <td className="py-3 px-3.5 font-bold text-slate-800">{row.leaveDays} days</td>
                                            <td className="py-3 px-3.5 font-bold text-slate-800">{row.totalWorkingHours} hrs</td>
                                            <td className="py-3 px-3.5 text-slate-600">{row.totalBreakDuration} mins</td>
                                            <td className="py-3 px-3.5 text-slate-600">{row.totalOvertimeHours} hrs</td>
                                            <td className="py-3 px-3.5">
                                                {row.lateDaysCount > 0 ? (
                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full border border-amber-100 inline-block">{row.lateDaysCount} Late</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 inline-block">On time</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : reportData.employee ? (
                                    /* Single employee detail row */
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{reportData.employee?.name}</span>
                                                <span className="text-slate-400 text-xs">{reportData.employee?.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3.5 font-bold text-slate-800">{reportData.presentDays} days</td>
                                        <td className="py-3 px-3.5 font-bold text-slate-800">{reportData.leaveDays} days</td>
                                        <td className="py-3 px-3.5 font-bold text-slate-800">{reportData.totalWorkingHours} hrs</td>
                                        <td className="py-3 px-3.5 text-slate-600">{reportData.totalBreakDuration} mins</td>
                                        <td className="py-3 px-3.5 text-slate-600">{reportData.totalOvertimeHours} hrs</td>
                                        <td className="py-3 px-3.5">
                                            {reportData.lateDaysCount > 0 ? (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full border border-amber-100 inline-block">{reportData.lateDaysCount} Late</span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 inline-block">On time</span>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-6 text-center text-slate-400">No entries available for selected month.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Add dailyLogs breakdown for focused individual view */}
                    {!Array.isArray(reportData) && reportData.dailyLogs?.length > 0 && (
                        <div className="p-3 bg-slate-50/50 border-t border-slate-200/60">
                            <h5 className="font-bold text-slate-700 text-xs mb-2">Staff Shift Logs Breakdown</h5>
                            <div className="overflow-x-auto rounded-lg border border-slate-200/60 bg-white">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Clock In</th>
                                            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Clock Out</th>
                                            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Total Working Hrs</th>
                                            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Break Time</th>
                                            <th className="py-2 px-3 font-bold text-slate-500 uppercase tracking-wider">Late Info</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reportData.dailyLogs.map((log, lidx) => (
                                            <tr key={lidx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-2 px-3 font-medium text-slate-800">
                                                    {new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </td>
                                                <td className="py-2 px-3 text-slate-600">
                                                    {log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                                                </td>
                                                <td className="py-2 px-3 text-slate-600">
                                                    {log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Active / Working"}
                                                </td>
                                                <td className="py-2 px-3 font-bold text-slate-700">{log.totalHours || 0} hrs</td>
                                                <td className="py-2 px-3 text-slate-500">{log.breakTime || 0} mins</td>
                                                <td className="py-2 px-3">
                                                    {log.isLate ? (
                                                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full border border-amber-100">Late by {log.lateBy}m</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">On time</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HRDashboardPage;
