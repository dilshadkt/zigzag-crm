import React, { useState, useRef, useEffect } from "react";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import Header from "../../components/shared/header";
import UserProfile from "../../components/shared/profile";
import { IoArrowUpOutline } from "react-icons/io5";
import { RiMoreLine } from "react-icons/ri";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  parseISO,
  isSameDay,
  addDays,
  isAfter,
  isBefore,
} from "date-fns";
import {
  useGetCompanyVacations,
  useGetVacationsCalendar,
  useUpdateVacationStatus,
  useUpdateVacationRequest,
} from "../../api/hooks";
import VacationRequestModal from "../../components/vacations/VacationRequestModal";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

// Add the Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
  </div>
);

// Modal for modifying date range
const ModifyDatesModal = ({ isOpen, onClose, request, onSave }) => {
  const [formData, setFormData] = useState({
    startDate: format(new Date(request?.startDate || new Date()), "yyyy-MM-dd"),
    endDate: format(new Date(request?.endDate || new Date()), "yyyy-MM-dd"),
  });
  const [selectionMode, setSelectionMode] = useState("start"); // "start" or "end"
  const [currentMonth, setCurrentMonth] = useState(
    new Date(request?.startDate || new Date())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(request?.type || "vacation");
  useEffect(() => {
    setFormData({
      startDate: format(new Date(request?.startDate || new Date()), "yyyy-MM-dd"),
      endDate: format(new Date(request?.endDate || new Date()), "yyyy-MM-dd"),
    });
    setCurrentMonth(new Date(request?.startDate || new Date()));
    setSelectedType(request?.type || "vacation");
    setSelectionMode("start");
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        type: selectedType,
      });
      onClose();
    } catch (error) {
      console.error("Error updating vacation dates:", error);
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
      // Set both start and end date to the selected date
      setFormData((prev) => ({
        ...prev,
        startDate: format(date, "yyyy-MM-dd"),
        endDate: format(date, "yyyy-MM-dd"),
      }));
      setSelectionMode("end");
    } else {
      // Only update end date
      const startDate = parseISO(formData.startDate);

      // Ensure end date is not before start date
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

  // Calendar rendering helpers
  const getMonthName = () => {
    return format(currentMonth, "MMMM, yyyy");
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay() || 7; // 0 is Sunday, make it 7
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.unshift(addDays(firstDay, -i));
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  // Check if a date is within the selected range
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

  // Check if a date is specifically the start date
  const isStartDate = (date) => {
    if (!formData.startDate) return false;
    const currentDate = new Date(date);
    const startDate = parseISO(formData.startDate);
    return isSameDay(currentDate, startDate);
  };

  // Check if a date is specifically the end date
  const isEndDate = (date) => {
    if (!formData.endDate) return false;
    const currentDate = new Date(date);
    const endDate = parseISO(formData.endDate);
    return isSameDay(currentDate, endDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Modify Request Dates
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 bg-[#F4F9FD] rounded-lg 
            flex items-center justify-center w-[40px] h-[40px] cursor-pointer hover:text-gray-700"
          >
            <RxCross2 size={18} className="text-gray-800" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-[#D8E0F0] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="vacation">Vacation</option>
            <option value="sick_leave">Sick Leave</option>
            <option value="remote_work">Work Remotely</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">
              {request?.type?.replace("_", " ")}
            </span>
            <span className="block text-xs text-gray-500 mt-1">
              Original request:{" "}
              {format(new Date(request?.startDate), "MMM dd, yyyy")} -{" "}
              {format(new Date(request?.endDate), "MMM dd, yyyy")}
            </span>
          </div>

          {/* Calendar */}
          <div className="border border-[#D8E0F0] rounded-xl p-7 mb-4">
            <div className="flex justify-between items-center  mb-6">
              <button
                type="button"
                onClick={previousMonth}
                className="text-blue-500 cursor-pointer flex items-center justify-center"
              >
                <IoIosArrowBack />
              </button>
              <h3 className="font-bold text-gray-800">{getMonthName()}</h3>
              <button
                type="button"
                onClick={nextMonth}
                className="text-blue-500 cursor-pointer flex items-center justify-center"
              >
                <IoIosArrowForward />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center">
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Mon
              </div>
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Tue
              </div>
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Wed
              </div>
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Thu
              </div>
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Fri
              </div>
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Sat
              </div>
              <div className="text-gray-500 mx-0.5 bg-[#F4F9FD] py-1 font-medium text-xs rounded-md">
                Sun
              </div>

              {getDaysInMonth().map((day, index) => {
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const inRange = isInRange(day);
                const isStart = isStartDate(day);
                const isEnd = isEndDate(day);

                return (
                  <div
                    key={index}
                    onClick={() => isCurrentMonth && selectDate(day)}
                    className={`
                      h-12 w-full mx-auto 
                      flex items-center justify-center text-sm
                      ${!isCurrentMonth ? "text-gray-300" : ""}
                      ${
                        inRange && !isStart && !isEnd
                          ? "bg-[#15C0E6] text-white"
                          : ""
                      }
                      ${isStart ? "bg-[#15C0E6] text-white rounded-l-xl" : ""}
                      ${isEnd ? "bg-[#15C0E6] text-white rounded-r-xl" : ""}
                      ${isCurrentMonth && !inRange ? "hover:bg-gray-100" : ""}
                      cursor-pointer
                    `}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-3">
            <span className="text-sm text-gray-500 self-center">
              Selected: {format(new Date(formData.startDate), "MMM dd")} -{" "}
              {format(new Date(formData.endDate), "MMM dd")}
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-3 text-sm font-medium text-white bg-[#3F8CFF] 
              rounded-xl hover:bg-[#3F8CFF]/90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add dropdown menu component for vacation approval
const ApprovalMenu = ({
  onApprove,
  onReject,
  onModify,
  onCancel,
  isOpen,
  setIsOpen,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-4 top-12 bg-white shadow-lg rounded-lg py-2 z-10 min-w-[140px]"
    >
      <button
        onClick={onApprove}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-green-600"
      >
        <FaCheck size={12} />
        <span>Approve</span>
      </button>
      <button
        onClick={onModify}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-blue-600"
      >
        <FaEdit size={12} />
        <span>Modify dates</span>
      </button>
      <button
        onClick={onReject}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-500"
      >
        <FaTimes size={12} />
        <span>Reject</span>
      </button>
      <button
        onClick={onCancel}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-600"
      >
        <FaTimes size={12} />
        <span>Cancel</span>
      </button>
    </div>
  );
};

const VacationCard = ({
  item,
  updateStatus,
  canApproveVacations,
  canModifyVacations,
  onModifyRequest,
}) => {
  const { user, isCompany } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(false);
  const [modifyingRequest, setModifyingRequest] = useState(null);

  // Filter pending vacation requests
  const pendingRequests = item.vacationRequests.filter(
    (req) => req.status === "pending"
  );

  const handleApprove = (requestId) => {
    updateStatus({ vacationId: requestId, status: "approved" });
    setMenuOpen(false);
  };

  const handleReject = (requestId) => {
    updateStatus({ vacationId: requestId, status: "rejected" });
    setMenuOpen(false);
  };

  const handleModifyOpen = (request) => {
    setModifyingRequest(request);
    setMenuOpen(false);
  };

  const handleCancel = (requestId) => {
    updateStatus({ vacationId: requestId, status: "cancelled" });
    setMenuOpen(false);
  };

  const handleModifySave = (requestId, newDates) => {
    if (!onModifyRequest) {
      return Promise.resolve();
    }
    return onModifyRequest(requestId, newDates);
  };

  return (
    <div className="rounded-3xl bg-white py-5 px-7 grid grid-cols-2 relative">
      <UserProfile
        user={{
          name: item.employee.name,
          email: "", // No email in our API response
          profile: item.employee.profileImage,
        }}
      />
      <div className="grid grid-cols-3">
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Vacations</h5>
          <span>{item?.vacations?.vacation || 0} days</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Sick Leave</h5>
          <span>{item?.vacations?.sick_leave || 0} days</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <h5 className="text-sm text-[#91929E]">Work remotely</h5>
          <span>{item?.vacations?.remote_work || 0} days</span>
        </div>
      </div>

      {pendingRequests.length > 0 && canApproveVacations && (
        <>
          <div className="col-span-2 mt-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setExpandedRequests(!expandedRequests)}
                className="text-sm text-blue-600 hover:underline"
              >
                {expandedRequests ? "Hide" : "Show"} pending requests (
                {pendingRequests.length})
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <RiMoreLine size={20} />
              </button>
              <ApprovalMenu
                isOpen={menuOpen}
                setIsOpen={setMenuOpen}
                onApprove={() => handleApprove(pendingRequests[0].id)}
                onModify={() => handleModifyOpen(pendingRequests[0])}
                onReject={() => handleReject(pendingRequests[0].id)}
                onCancel={() => handleCancel(pendingRequests[0].id)}
              />
            </div>

            {expandedRequests && (
              <div className="mt-3 space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-blue-50 p-3 rounded-lg flex justify-between"
                  >
                    <div>
                      <span className="font-medium capitalize">
                        {request.type.replace("_", " ")}
                      </span>
                      <div className="text-sm text-gray-600">
                        {format(new Date(request.startDate), "MMM dd")} -{" "}
                        {format(new Date(request.endDate), "MMM dd")}
                        {request.project && (
                          <span> • Project: {request.project.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {canModifyVacations && (
                        <button
                          onClick={() => handleModifyOpen(request)}
                          className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                          title="Modify dates"
                        >
                          <FaEdit size={12} />
                        </button>
                      )}
                      {canModifyVacations && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100"
                          title="Cancel request"
                        >
                          Cancel
                        </button>
                      )}
                      {canApproveVacations && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600"
                            title="Approve"
                          >
                            <FaCheck size={12} />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600"
                            title="Reject"
                          >
                            <FaTimes size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modify dates modal */}
      {modifyingRequest && (
        <ModifyDatesModal
          isOpen={true}
          onClose={() => setModifyingRequest(null)}
          request={modifyingRequest}
          onSave={(newDates) => handleModifySave(modifyingRequest.id, newDates)}
        />
      )}
    </div>
  );
};

const Vacations = () => {
  const { user, isCompany } = useAuth();
  const { hasPermission } = usePermissions();
  const [stat, setStat] = useState("Employees' vacations");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Permission checks for vacation access
  const canViewVacations = isCompany || hasPermission("vacations", "view");
  const canCreateVacationRequest =
    isCompany || hasPermission("vacations", "create");
  const canApproveVacations =
    isCompany || hasPermission("vacations", "approve");
  const canEditVacations = isCompany || hasPermission("vacations", "edit");

  // If user doesn't have view permission, show access denied message
  if (!canViewVacations) {
    return (
      <section className="flex flex-col h-full gap-y-3">
        <div className="flexBetween">
          <Header>Vacations</Header>
        </div>
        <div className="bg-white h-full flexCenter rounded-3xl p-6 text-center">
          <div className="max-w-md">
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
              You don't have permission to view vacation data. Please contact
              your administrator to request access.
            </p>
            <div className="text-sm text-gray-500">
              Required permissions:{" "}
              <span className="font-medium">vacations.view</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Get month and year for API calls
  const month = currentDate.getMonth() + 1; // 1-12
  const year = currentDate.getFullYear();

  // API data hooks
  const { data: companyVacationsData, isLoading: isLoadingEmployees } =
    useGetCompanyVacations(month, year);

  const { data: calendarData, isLoading: isLoadingCalendar } =
    useGetVacationsCalendar(month, year);

  const updateVacationMutation = useUpdateVacationStatus();
  const updateVacationRequestMutation = useUpdateVacationRequest();

  const handleUpdateVacationStatus = ({ vacationId, status, notes = "" }) => {
    updateVacationMutation.mutate({ vacationId, status, notes });
  };

  const handleModifyVacationRequest = (vacationId, updates) => {
    return updateVacationRequestMutation.mutateAsync({
      vacationId,
      data: updates,
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const formattedDate = (date) => format(new Date(date), "yyyy-MM-dd");

  const calendarDays = [
    ...daysInMonth.map((date) => ({
      day: format(date, "EEE"),
      date: format(date, "d"),
      fullDate: date,
    })),
    ...Array(31 - daysInMonth.length).fill({ day: "", date: "" }),
  ];

  // Determine background color based on vacation type and status
  const generateBgColor = (employee, date) => {
    if (!calendarData?.calendar) return ["#F4F9FD", true];

    const employeeData = calendarData.calendar.find(
      (emp) => emp.employee.id === employee.employee.id
    );

    if (!employeeData) return ["#F4F9FD", true];

    // Find if employee has vacation on this date
    const vacationOnDate = employeeData.dates.find((d) =>
      isSameDay(new Date(d.date), date)
    );

    if (!vacationOnDate) return ["#F4F9FD", true];

    // Determine color based on vacation type
    if (vacationOnDate.type === "remote_work") {
      return ["#6D5DD3", vacationOnDate.status === "approved"];
    } else if (vacationOnDate.type === "sick_leave") {
      return ["#F65160", vacationOnDate.status === "approved"];
    } else if (vacationOnDate.type === "vacation") {
      return ["#15C0E6", vacationOnDate.status === "approved"];
    }

    return ["#F4F9FD", true];
  };

  const renderStat = () => {
    if (isLoadingEmployees || isLoadingCalendar) {
      return (
        <div className="w-full h-64 flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

    // Show limited access message for users with view permission but no management permissions
    if (
      !canApproveVacations &&
      !canEditVacations &&
      !canCreateVacationRequest
    ) {
      return (
        <div className="bg-white h-full flexCenter rounded-3xl p-6 text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flexCenter mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Only Access
            </h3>
            <p className="text-gray-600 mb-4">
              You can view vacation data but don't have permission to manage
              vacation requests. Contact your administrator for management
              permissions.
            </p>
            <div className="text-sm text-gray-500">
              Available permissions:{" "}
              <span className="font-medium">vacations.view</span>
            </div>
          </div>
        </div>
      );
    }

    if (stat === "Employees' vacations") {
      return (
        <div className="flex flex-col h-full overflow-y-auto gap-y-3 mt-3">
          {companyVacationsData?.employees.map((item, index) => (
            <VacationCard
              key={index}
              item={item}
              updateStatus={handleUpdateVacationStatus}
              canApproveVacations={canApproveVacations}
              canModifyVacations={canEditVacations}
              onModifyRequest={handleModifyVacationRequest}
            />
          ))}

          {companyVacationsData?.employees.length === 0 && (
            <div className="bg-white h-full flexCenter rounded-3xl p-6 text-center text-gray-500">
              No vacation data available. Add vacation requests to see them
              here.
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex flex-col mt-3 overflow-hidden bg-white rounded-3xl">
          <div className="min-h-[88px] w-full flex">
            <div className="min-w-[240px] border-b border-r border-[#E6EBF5] h-full flexCenter">
              <div className="flexBetween w-full pl-6 pr-4">
                <h4 className="font-medium">Employees</h4>
                <PrimaryButton
                  icon={"/icons/search.svg"}
                  className={"bg-[#F4F9FD]"}
                />
              </div>
            </div>
            <div className="w-full border-b border-[#E6EBF5] flex flex-col">
              <div className="w-full h-full flexCenter relative">
                <span className="font-medium ">
                  First month - {format(firstDay, "MMMM (yyyy)")}
                </span>
                <div className="flexStart gap-x-2 absolute right-6 top-0 bottom-0 my-auto">
                  <button onClick={handlePrevMonth}>
                    <IoArrowUpOutline
                      className="-rotate-90 cursor-pointer text-xl
                     text-[#C9CCD1] hover:scale-75 hover:text-[#3F8CFF]"
                    />
                  </button>
                  <button onClick={handleNextMonth}>
                    <IoArrowUpOutline
                      className="rotate-90 cursor-pointer text-xl
                     text-[#C9CCD1] hover:scale-75 hover:text-[#3F8CFF]"
                    />
                  </button>
                </div>
              </div>
              <div className="h-full gap-x-1 grid grid-cols-31 overflow-x-auto flexStart m-1">
                {calendarDays.map((item, index) => (
                  <div
                    key={index}
                    className="w-full min-w-[28px] h-10 rounded-[7px] bg-[#F4F9FD] flexCenter flex-col"
                  >
                    <span className="text-[13px] font-medium text-[#7D8593]">
                      {item?.date}
                    </span>
                    <span className="text-[11px] text-[#7D8594] -translate-y-1">
                      {item?.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full border-b overflow-y-auto flexStart border-[#E6EBF5] h-full">
            <div className="w-full h-full overflow-y-auto">
              {calendarData?.calendar.map((employee, index) => (
                <div className="flex w-full" key={index}>
                  <div
                    className="min-h-[52px] min-w-[240px] border-r border-b border-[#E6EBF5] flexStart gap-x-[10px]
                      px-6"
                  >
                    <div className="w-6 h-6 overflow-hidden rounded-full flexCenter bg-gray-200">
                      {employee.employee.profileImage ? (
                        <img
                          src={employee.employee.profileImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {employee.employee.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span>{employee.employee.name}</span>
                  </div>
                  <div className="w-full h-[52px] border-b border-[#E6EBF5] gap-x-1 grid grid-cols-31 flexStart px-1">
                    {daysInMonth.map((date, idx) => {
                      const [bgColor, isApproved] = generateBgColor(
                        employee,
                        date
                      );
                      return (
                        <div
                          title={formattedDate(date)}
                          key={idx}
                          style={{
                            borderColor: bgColor,
                          }}
                          className={`min-w-[28px] overflow-hidden w-full h-10 rounded-[7px] 
                          ${!isApproved && `border-[1.55px]`}
                          flexCenter flex-col`}
                        >
                          <div
                            style={{
                              background: bgColor,
                              opacity: isApproved ? 1 : 0.2,
                            }}
                            className="w-full h-full rounded-[5px]"
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {calendarData?.calendar.length === 0 && (
                <div className="w-full p-4 text-center text-gray-500">
                  No employee data available
                </div>
              )}
            </div>
          </div>
          <div className="min-h-[75px] w-full flexStart">
            <div className="min-w-[240px] h-full border-r border-[#E6EBF5]"></div>
            <div className="w-full h-full px-7 flexCenter">
              <div className="w-full grid grid-cols-3">
                <div className="flex flex-col gap-y-1">
                  <span className="text-sm text-[#7D8592] font-medium">
                    Sick Leave
                  </span>
                  <div className="flexStart gap-x-2">
                    <div className="w-[10px] h-[10px] rounded-full bg-red-400"></div>
                    <span>Approved</span>
                    <div className="w-[10px] ml-5 h-[10px] rounded-full border-2 border-red-400 bg-red-400/50"></div>
                    <span>Pending</span>
                  </div>
                </div>
                <div className="flexCenter">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#7D8592] font-medium">
                      Work remotely
                    </span>
                    <div className="flexStart gap-x-2">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#6D5DD3]"></div>
                      <span>Approved</span>
                      <div className="w-[10px] ml-5 h-[10px] rounded-full border-2 border-[#6D5DD3] bg-[#6D5DD3]/50"></div>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
                <div className="flexEnd">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-sm text-[#7D8592] font-medium">
                      Vacation
                    </span>
                    <div className="flexStart gap-x-2">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#15C0E6]"></div>
                      <span>Approved</span>
                      <div className="w-[10px] ml-5 h-[10px] rounded-full border-2 border-[#15C0E6] bg-[#15C0E6]/50"></div>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="flex flex-col h-full gap-y-3">
      {/* header  */}
      <div className="flexBetween ">
        <Header>Vacations</Header>
        <ButtonToggle
          setValue={setStat}
          value={stat}
          values={["Employees' vacations", "Calendar"]}
        />
        {canCreateVacationRequest && (
          <PrimaryButton
            icon={"/icons/add.svg"}
            title={"Add Request"}
            className={"mt-3 px-5 text-white"}
            onclick={() => setShowRequestModal(true)}
          />
        )}
      </div>
      {/* body part  */}
      {renderStat()}

      {/* Vacation request modal */}
      {showRequestModal && (
        <VacationRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </section>
  );
};

export default Vacations;
