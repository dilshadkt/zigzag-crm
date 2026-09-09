import React, { useState, useEffect, useMemo, useRef } from "react";
import { attendanceApi } from "../../features/attendance/api/attendanceApi";
import { useEmpoyees } from "../../api/hooks";
import { FiClock, FiCalendar, FiCoffee, FiAlertCircle, FiDownload, FiSearch } from "react-icons/fi";
import PendingTimeChangeList from "../../features/attendance/components/PendingTimeChangeList";

const SkeletonItem = ({ className }) => (
    <div className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`} />
);

const PERIOD_OPTIONS = [
    { value: "today", label: "Today" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "custom", label: "Custom" },
];

const toYmd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const formatDisplayDate = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getPresetDateRange = (mode) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (mode === "today") {
        const ymd = toYmd(today);
        return { start: ymd, end: ymd };
    }

    if (mode === "thisWeek") {
        const currentDay = today.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + mondayOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { start: toYmd(weekStart), end: toYmd(weekEnd) };
    }

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: toYmd(monthStart), end: toYmd(monthEnd) };
};

const HRDashboardPage = () => {
    // State for filtering — default to this month
    const [filterMode, setFilterMode] = useState("thisMonth");
    const [customStartDate, setCustomStartDate] = useState(() => getPresetDateRange("thisMonth").start);
    const [customEndDate, setCustomEndDate] = useState(() => getPresetDateRange("thisMonth").end);
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
    const [singleEmployeeReport, setSingleEmployeeReport] = useState(null);
    const [todayHighlights, setTodayHighlights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSingle, setIsLoadingSingle] = useState(false);
    const [error, setError] = useState(null);

    const reportDateRange = useMemo(() => {
        if (filterMode === "custom") {
            if (!customStartDate || !customEndDate) return null;
            return { startDate: customStartDate, endDate: customEndDate };
        }
        const range = getPresetDateRange(filterMode);
        return { startDate: range.start, endDate: range.end };
    }, [filterMode, customStartDate, customEndDate]);

    const periodLabel = PERIOD_OPTIONS.find((opt) => opt.value === filterMode)?.label || "This Month";
    const rangeDisplay =
        reportDateRange?.startDate && reportDateRange?.endDate
            ? reportDateRange.startDate === reportDateRange.endDate
                ? formatDisplayDate(reportDateRange.startDate)
                : `${formatDisplayDate(reportDateRange.startDate)} – ${formatDisplayDate(reportDateRange.endDate)}`
            : "";

    // Fetch all-staff report when the selected period changes
    const fetchAllStaffReport = async (silent = false) => {
        if (!reportDateRange) return;
        if (!silent) {
            setIsLoading(true);
            setError(null);
        }
        try {
            const res = await attendanceApi.getStaffMonthlyReport(
                "",
                "",
                "",
                reportDateRange
            );
            if (res.success) {
                setReportData(res.report);
                setTodayHighlights(res.todayHighlights);
            } else if (!silent) {
                setError(res.message || "Failed to fetch staff report");
            }
        } catch (err) {
            console.error("Failed to fetch staff monthly report:", err);
            if (!silent) {
                setError(err.response?.data?.message || err.message || "Error fetching report");
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // Fetch single employee report when selectedEmployeeId or date filter changes
    const fetchSingleReport = async () => {
        if (!selectedEmployeeId) {
            setSingleEmployeeReport(null);
            return;
        }
        if (!reportDateRange) return;
        setIsLoadingSingle(true);
        try {
            const empRes = await attendanceApi.getStaffMonthlyReport(
                "",
                "",
                selectedEmployeeId,
                reportDateRange
            );
            if (empRes.success) {
                setSingleEmployeeReport(empRes.report);
            } else {
                setSingleEmployeeReport(null);
            }
        } catch (err) {
            console.error("Failed to fetch single staff report:", err);
        } finally {
            setIsLoadingSingle(false);
        }
    };

    useEffect(() => {
        fetchAllStaffReport();
    }, [reportDateRange]);

    useEffect(() => {
        fetchSingleReport();
    }, [selectedEmployeeId, reportDateRange]);

    // Handle export to CSV
    const handleExport = () => {
        if (!reportData) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Staff Name,Email,Position,Present Days,Leave Days,Total Worked Hours,Total Break Time (mins),Overtime (hrs),Late Arrivals\r\n";

        if (Array.isArray(reportData)) {
            reportData.forEach(row => {
                csvContent += `"${row.employee?.name}","${row.employee?.email}","${row.employee?.position || "N/A"}",${row.presentDays},${row.leaveDays},${row.totalWorkingHours},${row.totalBreakDuration},${row.totalOvertimeHours},${row.lateDaysCount}\r\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const fileSuffix =
            reportDateRange?.startDate && reportDateRange?.endDate
                ? `${reportDateRange.startDate}_to_${reportDateRange.endDate}`
                : "report";
        link.setAttribute("download", `Attendance_Report_${fileSuffix}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate aggregated totals if multiple staff are viewed
    const totals = useMemo(() => {
        if (!reportData || !Array.isArray(reportData)) {
            return { presentDays: 0, leaveDays: 0, workingHours: 0, breakTime: 0, overtime: 0, lateCount: 0 };
        }

        if (selectedEmployeeId) {
            const empReport = reportData.find(r => r.employee?.id === selectedEmployeeId || r.employee?._id === selectedEmployeeId || r.employeeId === selectedEmployeeId);
            if (empReport) {
                return {
                    presentDays: empReport.presentDays || 0,
                    leaveDays: empReport.leaveDays || 0,
                    workingHours: empReport.totalWorkingHours || 0,
                    breakTime: empReport.totalBreakDuration || 0,
                    overtime: empReport.totalOvertimeHours || 0,
                    lateCount: empReport.lateDaysCount || 0
                };
            }
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
    }, [reportData, selectedEmployeeId]);

    const overtimeList = useMemo(() => {
        if (!reportData || !Array.isArray(reportData)) return [];
        if (selectedEmployeeId) {
            const empReport = reportData.find(r => r.employee?.id === selectedEmployeeId || r.employee?._id === selectedEmployeeId || r.employeeId === selectedEmployeeId);
            if (empReport && empReport.totalOvertimeHours > 0) {
                return [empReport];
            }
            return [];
        }
        return reportData.filter(row => row.totalOvertimeHours > 0);
    }, [reportData, selectedEmployeeId]);

    // Group daily logs by date so multiple shifts on the same day appear as a single row
    const groupedDailyLogs = useMemo(() => {
        if (!singleEmployeeReport?.dailyLogs) return [];
        
        const groups = {};
        
        singleEmployeeReport.dailyLogs.forEach(log => {
            if (!log.date) return;
            const dateStr = new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            
            if (!groups[dateStr]) {
                groups[dateStr] = {
                    date: dateStr,
                    originalDate: log.date,
                    clockInTime: log.clockInTime,
                    clockOutTime: log.clockOutTime,
                    totalHours: Number(log.totalHours || 0),
                    breakTime: Number(log.breakTime || 0),
                    isLate: log.isLate,
                    lateBy: log.lateBy || 0,
                    isActive: !log.clockOutTime
                };
            } else {
                const current = groups[dateStr];
                
                // Earliest clock in
                if (log.clockInTime && (!current.clockInTime || new Date(log.clockInTime) < new Date(current.clockInTime))) {
                    current.clockInTime = log.clockInTime;
                }
                
                // Latest clock out (or keep active)
                if (!log.clockOutTime) {
                    current.isActive = true;
                    current.clockOutTime = null;
                } else if (!current.isActive && log.clockOutTime) {
                    if (!current.clockOutTime || new Date(log.clockOutTime) > new Date(current.clockOutTime)) {
                        current.clockOutTime = log.clockOutTime;
                    }
                }
                
                // Sum hours and breaks
                current.totalHours += Number(log.totalHours || 0);
                current.breakTime += Number(log.breakTime || 0);
                
                // Late logic
                if (log.isLate && (!current.clockInTime || new Date(log.clockInTime) === new Date(current.clockInTime))) {
                    current.isLate = true;
                    if (log.lateBy > current.lateBy) current.lateBy = log.lateBy;
                }
            }
        });
        
        return Object.values(groups).sort((a, b) => new Date(a.originalDate) - new Date(b.originalDate));
    }, [singleEmployeeReport]);

    return (
        <div className="flex flex-col gap-4 h-full   overflow-y-auto p-2 md:p-4">
            {/* Header section with minimal design */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">HR Attendance & Leave Dashboard</h2>
                    <p className="text-xs text-slate-500">Track and view staff attendance metrics for today, this week, this month, or a custom date range.</p>
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
                    {/* Period Selector */}
                    <div className="flex flex-col gap-1 min-w-[160px]">
                        <label htmlFor="hr-period-filter" className="text-xs font-semibold text-slate-500 tracking-wider">Period</label>
                        <select
                            id="hr-period-filter"
                            aria-label="Select report period"
                            value={filterMode}
                            onChange={(e) => {
                                const mode = e.target.value;
                                if (mode === "custom") {
                                    const current = reportDateRange
                                        ? { start: reportDateRange.startDate, end: reportDateRange.endDate }
                                        : getPresetDateRange("thisMonth");
                                    setCustomStartDate(current.start);
                                    setCustomEndDate(current.end);
                                }
                                setFilterMode(mode);
                            }}
                            className="border border-slate-200 rounded-lg p-2 text-slate-700 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-400 text-xs font-medium transition-all cursor-pointer"
                        >
                            {PERIOD_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="text-slate-900 bg-white">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {filterMode === "custom" ? (
                        <>
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <label htmlFor="hr-custom-from" className="text-xs font-semibold text-slate-500 tracking-wider">From</label>
                                <input
                                    id="hr-custom-from"
                                    type="date"
                                    value={customStartDate}
                                    max={customEndDate || undefined}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setCustomStartDate(value);
                                        if (customEndDate && value > customEndDate) {
                                            setCustomEndDate(value);
                                        }
                                    }}
                                    className="border border-slate-200 rounded-lg p-2 text-slate-700 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-400 text-xs font-medium transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <label htmlFor="hr-custom-to" className="text-xs font-semibold text-slate-500 tracking-wider">To</label>
                                <input
                                    id="hr-custom-to"
                                    type="date"
                                    value={customEndDate}
                                    min={customStartDate || undefined}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setCustomEndDate(value);
                                        if (customStartDate && value < customStartDate) {
                                            setCustomStartDate(value);
                                        }
                                    }}
                                    className="border border-slate-200 rounded-lg p-2 text-slate-700 bg-slate-50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-400 text-xs font-medium transition-all"
                                />
                            </div>
                        </>
                    ) : (
                        rangeDisplay && (
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <span className="text-xs font-semibold text-slate-500 tracking-wider">Dates</span>
                                <span className="border border-slate-200 rounded-lg p-2 text-slate-600 bg-slate-50 text-xs font-medium whitespace-nowrap">
                                    {rangeDisplay}
                                </span>
                            </div>
                        )
                    )}

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

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-medium flex items-center gap-2 text-xs">
                    <FiAlertCircle />
                    {error}
                </div>
            )}

            {/* Stat Cards Row - Compact design, no heavy shadows */}
            {isLoading && !reportData ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/60 flex flex-col gap-2 h-24">
                            <SkeletonItem className="h-9 w-9 rounded-lg" />
                            <SkeletonItem className="h-3 w-16 mt-1" />
                            <SkeletonItem className="h-6 w-10 mt-1" />
                        </div>
                    ))}
                </div>
            ) : !error && (
                <div className={`grid grid-cols-2 md:grid-cols-5 gap-3 ${isLoading ? "opacity-50 transition-opacity" : ""}`}>
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
            {isLoading && !reportData ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl p-3 border border-slate-200/60 h-72 flex flex-col gap-2">
                            <SkeletonItem className="h-4 w-32 border-b border-slate-100 pb-2 mb-2" />
                            {[1, 2, 3].map(j => (
                                <SkeletonItem key={j} className="h-10 w-full rounded-lg" />
                            ))}
                        </div>
                    ))}
                </div>
            ) : !error && (
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${isLoading ? "opacity-50 transition-opacity" : ""}`}>
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
                            <h5 className="font-bold text-slate-700 text-xs">
                                {filterMode === "today"
                                    ? "Today's Overtime"
                                    : filterMode === "thisWeek"
                                        ? "This Week's Overtime"
                                        : filterMode === "custom"
                                            ? "Period Overtime"
                                            : "This Month's Overtime"} ({overtimeList.length} Staff)
                            </h5>
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
                                <p className="text-slate-400 font-medium text-xs py-1">
                                    {filterMode === "today"
                                        ? "No overtime logged today."
                                        : filterMode === "thisWeek"
                                            ? "No overtime logged this week."
                                            : filterMode === "custom"
                                                ? "No overtime logged in this period."
                                                : "No overtime logged this month."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <PendingTimeChangeList
                onReviewed={() => {
                    fetchAllStaffReport(true);
                    fetchSingleReport();
                }}
            />

            {/* Table with clean design */}
            {isLoading && !reportData ? (
                <div className="bg-white min-h-[400px] rounded-xl border border-slate-200/60 p-4 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <SkeletonItem className="h-5 w-40" />
                        <SkeletonItem className="h-4 w-20 rounded animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4 items-center py-3 border-b border-slate-50 last:border-0">
                                <SkeletonItem className="h-10 w-10 rounded-full" />
                                <div className="flex-1 grid grid-cols-6 gap-4">
                                    <SkeletonItem className="h-4 w-24 col-span-2" />
                                    <SkeletonItem className="h-4 w-12" />
                                    <SkeletonItem className="h-4 w-12" />
                                    <SkeletonItem className="h-4 w-12" />
                                    <SkeletonItem className="h-4 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : !error && reportData && (
                <div className={`bg-white min-h-[400px] flex flex-col overflow-y-auto h-full rounded-xl border border-slate-200/60 overflow-hidden ${isLoading ? "opacity-50 transition-opacity" : ""}`}>
                    <div className="p-3 border-b border-slate-200/60 flex items-center justify-between bg-slate-50/50">
                        <h4 className="font-bold text-slate-700 text-sm">{periodLabel} Report Details</h4>
                        <span className="text-xs text-slate-400">Total {Array.isArray(reportData) ? reportData.length : 1} Staff</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left  border-collapse">
                            <thead>
                                <tr className="bg-slate-50 sticky top-0 z-50">
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
                                {Array.isArray(reportData) && reportData.length > 0 ? (
                                    reportData.map((row, idx) => (
                                        <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${selectedEmployeeId === (row.employee?.id || row.employee?._id || row.employeeId) ? "bg-blue-50/40 border-l-4 border-blue-500" : ""}`}>
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
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-6 text-center text-slate-400">No entries available for the selected period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Add dailyLogs breakdown for focused individual view */}
                    {selectedEmployeeId && (
                        <div className="p-3 bg-slate-50/50 border-t border-slate-200/60">
                            <h5 className="font-bold text-slate-700 text-xs mb-2">
                                Staff Shift Logs Breakdown for {singleEmployeeReport?.employee?.name || employeesList.find(emp => emp._id === selectedEmployeeId)?.name || "Selected Employee"}
                            </h5>
                            
                            {isLoadingSingle ? (
                                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200/60">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                                            <SkeletonItem className="h-4 w-24" />
                                            <SkeletonItem className="h-4 w-16" />
                                            <SkeletonItem className="h-4 w-16" />
                                            <SkeletonItem className="h-4 w-12" />
                                            <SkeletonItem className="h-4 w-12" />
                                            <SkeletonItem className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : singleEmployeeReport && singleEmployeeReport.dailyLogs?.length > 0 ? (
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
                                            {groupedDailyLogs.map((log, lidx) => (
                                                <tr key={lidx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-2 px-3 font-medium text-slate-800">
                                                        {log.date}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600">
                                                        {log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600">
                                                        {log.isActive ? "Active / Working" : (log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A")}
                                                    </td>
                                                    <td className="py-2 px-3 font-bold text-slate-700">{Number(log.totalHours || 0).toFixed(2)} hrs</td>
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
                            ) : (
                                <div className="bg-white p-4 text-center text-slate-400 text-xs rounded-lg border border-slate-200/60">
                                    No shift logs found for this period.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HRDashboardPage;
