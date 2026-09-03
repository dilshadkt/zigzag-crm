import React, { useState } from "react";
import { useCreateVacationRequest, useGetEmployeeVacations } from "../hooks/useVacations";
import {
  format,
  addDays,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useAuth } from "../../../hooks/useAuth";
import { useGetMyVacations, useGetLeavePolicy, useGetAllEmployees } from "../../../api/hooks";
import { usePermissions } from "../../../hooks/usePermissions";
import { getLeaveLimits } from "../../../utils/leaveEntitlement";

const VacationRequestModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    type: "vacation",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    project: "",
    reason: "",
    employeeId: "",
  });
  const [selectionMode, setSelectionMode] = useState("start");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const createVacationMutation = useCreateVacationRequest();

  const { user, isCompany } = useAuth();
  const { hasPermission } = usePermissions();
  const canApproveVacations = isCompany || hasPermission("vacations", "approve");

  const { data: leavePolicy } = useGetLeavePolicy(user?.company);
  const { data: myVacationsData } = useGetMyVacations();

  // Only fetch employees if user is an admin or HR
  const { data: employeesData } = useGetAllEmployees(canApproveVacations);
  const employeesList = canApproveVacations ? (employeesData?.employees || []) : [];
  const selectedEmployee = formData.employeeId
    ? employeesList.find((emp) => emp._id === formData.employeeId)
    : null;
  const targetEmployee = selectedEmployee || {
    ...user,
    isOnProbation:
      user?.isOnProbation || myVacationsData?.employee?.isOnProbation,
    leaveQuotas: user?.leaveQuotas || myVacationsData?.employee?.leaveQuotas,
  };
  const targetOnProbation = Boolean(targetEmployee?.isOnProbation);

  const limits = getLeaveLimits(targetEmployee, leavePolicy || []);
  const vacationLimit = limits.vacation;
  const sickLeaveLimit = limits.sick_leave;
  const remoteWorkLimit = limits.remote_work;

  const { data: employeeVacationsData } = useGetEmployeeVacations(formData.employeeId);
  const employeeVacationsSummary = employeeVacationsData?.summary;

  const usedVacation = formData.employeeId ? (employeeVacationsSummary?.vacation || 0) : (myVacationsData?.summary?.vacation || 0);
  const usedSick = formData.employeeId ? (employeeVacationsSummary?.sick_leave || 0) : (myVacationsData?.summary?.sick_leave || 0);
  const usedRemote = formData.employeeId ? (employeeVacationsSummary?.remote_work || 0) : (myVacationsData?.summary?.remote_work || 0);

  const vacationBalance = vacationLimit - usedVacation;
  const sickBalance = sickLeaveLimit - usedSick;
  const remoteBalance = remoteWorkLimit - usedRemote;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    if (targetOnProbation) {
      setSubmitError(
        "Employees on probation cannot request leave. Leave is not available during the probation period."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      await createVacationMutation.mutateAsync({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        reason: formData.reason,
        project: formData.project || undefined,
        employeeId: formData.employeeId || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error creating vacation request:", error);
      setSubmitError(
        error.response?.data?.message || "Failed to create vacation request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const selectDate = (date) => {
    if (selectionMode === "start") {
      setFormData((prev) => ({
        ...prev,
        startDate: format(date, "yyyy-MM-dd"),
        endDate: format(date, "yyyy-MM-dd"),
      }));
      setSelectionMode("end");
    } else {
      const startDate = parseISO(formData.startDate);
      if (isBefore(date, startDate)) {
        setFormData((prev) => ({
          ...prev,
          startDate: format(date, "yyyy-MM-dd"),
          endDate: format(startDate, "yyyy-MM-dd"),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          endDate: format(date, "yyyy-MM-dd"),
        }));
      }
      setSelectionMode("start");
    }
  };

  const getMonthName = () => format(currentMonth, "MMMM, yyyy");

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const firstDayOfWeek = firstDay.getDay() || 7;
    for (let i = 1; i < firstDayOfWeek; i++) days.unshift(addDays(firstDay, -i));

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) days.push(new Date(year, month + 1, i));

    return days;
  };

  const isInRange = (date) => {
    if (!formData.startDate || !formData.endDate) return false;
    const currentDate = new Date(date);
    const startDate = parseISO(formData.startDate);
    const endDate = parseISO(formData.endDate);
    return (
      (isSameDay(currentDate, startDate) || isAfter(currentDate, startDate)) &&
      (isSameDay(currentDate, endDate) || isBefore(currentDate, endDate))
    );
  };

  const isStartDate = (date) => {
    if (!formData.startDate) return false;
    const currentDate = new Date(date);
    const startDate = parseISO(formData.startDate);
    return isSameDay(currentDate, startDate);
  };

  const isEndDate = (date) => {
    if (!formData.endDate) return false;
    const currentDate = new Date(date);
    const endDate = parseISO(formData.endDate);
    return isSameDay(currentDate, endDate);
  };

  const duration = Math.ceil(Math.abs(new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full">
          {/* Left Column: Calendar (Slightly smaller) */}
          <div className="flex-1 bg-slate-50/50 p-6 md:p-8 border-r border-slate-100">
            <div className="flex justify-between items-center mb-6 px-1">
              <button
                type="button"
                onClick={previousMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-slate-400 hover:text-indigo-500 shadow-sm transition-all"
              >
                <IoIosArrowBack size={16} />
              </button>
              <h3 className="font-bold text-slate-700 text-sm tracking-tight">{getMonthName()}</h3>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-slate-400 hover:text-indigo-500 shadow-sm transition-all"
              >
                <IoIosArrowForward size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center gap-y-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-[10px] font-bold text-slate-300 mb-2 tracking-widest">{day}</div>
              ))}

              {getDaysInMonth().map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const inRange = isInRange(day);
                const isStart = isStartDate(day);
                const isEnd = isEndDate(day);

                return (
                  <div
                    key={index}
                    onClick={() => isCurrentMonth && selectDate(day)}
                    className={`
                      h-10 w-full relative flex items-center justify-center text-xs font-bold cursor-pointer transition-all
                      ${!isCurrentMonth ? "text-slate-200 pointer-events-none" : "text-slate-600"}
                      ${inRange && !isStart && !isEnd ? "bg-indigo-50 text-indigo-600" : ""}
                      ${isStart ? "bg-indigo-600 text-white rounded-l-xl z-10 shadow-md shadow-indigo-100" : ""}
                      ${isEnd ? "bg-indigo-600 text-white rounded-r-xl z-10 shadow-md shadow-indigo-100" : ""}
                      ${isCurrentMonth && !inRange ? "hover:bg-white hover:rounded-xl hover:shadow-sm" : ""}
                    `}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                  {duration} Days
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dates</span>
                <span className="block text-[11px] font-bold text-slate-700 mt-0.5">
                  {format(new Date(formData.startDate), "MMM dd")} - {format(new Date(formData.endDate), "dd")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Fields (More compact) */}
          <div className="w-full md:w-[320px] p-6 md:p-8 flex flex-col relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-all"
            >
              <RxCross2 size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Request Leave</h2>
              <p className="text-[11px] text-slate-400 font-medium">Select type and provide a reason.</p>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Type</label>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {[
                    { key: "vacation", label: "vacation", balance: vacationBalance },
                    { key: "sick_leave", label: "sick leave", balance: sickBalance },
                    { key: "remote_work", label: "remote work", balance: remoteBalance },
                  ].map(({ key, label, balance }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTypeChange(key)}
                      className={`flex-1 py-2 px-1 rounded-lg text-[9px] font-bold transition-all capitalize flex flex-col items-center justify-center
                        ${formData.type === key
                          ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50"
                          : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      <span>{label.replace("_", " ")}</span>
                      <span className="text-[8px] font-medium text-slate-400 mt-0.5">
                        ({balance} days)
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain your leave request..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none min-h-[90px] resize-none font-medium text-slate-600"
                />
              </div>

              {canApproveVacations && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Employee (Optional)</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium"
                    style={{ color: "#1e293b" }}
                  >
                    <option value="" style={{ color: "#1e293b" }}>Select Employee (Default: Self)</option>
                    {employeesList.map(emp => (
                      <option key={emp._id} value={emp._id} style={{ color: "#1e293b" }}>
                        {emp.name || `${emp.firstName} ${emp.lastName}`}
                        {emp.isOnProbation ? " (Probation)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetOnProbation && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-[11px] font-semibold text-center">
                  Don't have leave in probation. This employee cannot request leave.
                </div>
              )}
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[10px] font-bold text-center">
                {submitError}
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting || targetOnProbation}
                className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 
                rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-indigo-100"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationRequestModal;
