import React, { useState } from "react";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import Header from "../../components/shared/header";
import { IoArrowUpOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RiCalendarCheckLine } from "react-icons/ri";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import {
  useGetCompanyVacations,
  useGetVacationsCalendar,
  useUpdateVacationStatus,
  useUpdateVacationRequest,
} from "./hooks/useVacations";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

// Internal feature components
import Spinner from "./components/Spinner";
import VacationCard from "./components/VacationCard";
import VacationRequestModal from "./components/VacationRequestModal";

const Vacations = () => {
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [stat, setStat] = useState("Vacations");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRequestModal, setShowRequestModal] = useState(false);

  const canViewVacations = isCompany || hasPermission("vacations", "view");
  const canCreateVacationRequest =
    isCompany || hasPermission("vacations", "create");
  const canApproveVacations =
    isCompany || hasPermission("vacations", "approve");
  const canEditVacations = isCompany || hasPermission("vacations", "edit");

  if (!canViewVacations) {
    return (
      <section className="flex flex-col h-full gap-y-3">
        <div className="flexBetween ">
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

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

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

  const generateBgColor = (employeeData, date) => {
    if (!employeeData?.dates) return ["#F4F9FD", true, false];

    const targetDateStr = format(date, "yyyy-MM-dd");

    const vacationOnDate = employeeData.dates.find((d) => {
      return d.date === targetDateStr;
    });

    if (!vacationOnDate) return ["#F4F9FD", true, false];

    const isApproved = vacationOnDate.status === "approved";
    const isModifiedOut = vacationOnDate.status === "modified_out";

    if (vacationOnDate.type === "remote_work") {
      return ["#6D5DD3", isApproved, isModifiedOut];
    } else if (vacationOnDate.type === "sick_leave") {
      return ["#F65160", isApproved, isModifiedOut];
    } else if (vacationOnDate.type === "vacation") {
      return ["#15C0E6", isApproved, isModifiedOut];
    }

    return ["#F4F9FD", true, false];
  };

  const displayedEmployees = !isCompany && user?._id
    ? companyVacationsData?.employees?.filter(
        (item) => (item.employee?._id || item.employee?.id) === user._id
      )
    : companyVacationsData?.employees;

  const displayedCalendar = !isCompany && user?._id
    ? calendarData?.calendar?.filter(
        (item) => (item.employee?._id || item.employee?.id) === user._id
      )
    : calendarData?.calendar;

  const renderStat = () => {
    if (isLoadingEmployees || isLoadingCalendar) {
      return (
        <div className="w-full h-64 flex items-center justify-center">
          <Spinner />
        </div>
      );
    }

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

    if (stat === "Vacations") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-3 pb-6">
          {displayedEmployees?.map((item, index) => (
            <VacationCard
              key={index}
              item={item}
              updateStatus={handleUpdateVacationStatus}
              canApproveVacations={canApproveVacations}
              canModifyVacations={canEditVacations}
              onModifyRequest={handleModifyVacationRequest}
            />
          ))}

          {displayedEmployees?.length === 0 && (
            <div className="col-span-full bg-white h-64 flexCenter rounded-3xl p-6 text-center text-gray-400 border border-dashed border-gray-200">
              <div className="flex flex-col items-center gap-2">
                <RiCalendarCheckLine size={48} className="text-gray-200" />
                <p className="font-medium">No vacation data available</p>
                <p className="text-sm">Add vacation requests to see them here.</p>
              </div>
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
              <div className="w-full h-full flexCenter relative bg-slate-50/30">
                <span className="font-bold text-slate-500 text-xs tracking-wide uppercase">
                  {format(currentDate, "MMMM yyyy")}
                </span>
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
              {displayedCalendar?.map((employee, index) => (
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
                      const [bgColor, isApproved, isModifiedOut] =
                        generateBgColor(employee, date);
                      return (
                        <div
                          title={formattedDate(date)}
                          key={idx}
                          style={{
                            borderColor: isModifiedOut ? "#E6EBF5" : bgColor,
                          }}
                          className={`min-w-[28px] overflow-hidden w-full h-10 rounded-[7px] 
                          ${!isApproved && `border-[1.55px]`}
                          ${isModifiedOut && "border-dashed border-gray-300"}
                          flexCenter flex-col`}
                        >
                          <div
                            style={{
                              background: bgColor,
                              opacity: isModifiedOut ? 0.05 : isApproved ? 1 : 0.2,
                            }}
                            className="w-full h-full rounded-[5px]"
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {displayedCalendar?.length === 0 && (
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-2">
        {/* Left: Title */}
        <div className="flex items-center">
          <Header>Vacations</Header>
        </div>

        {/* Center: Tab Switch */}
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <ButtonToggle
            setValue={setStat}
            value={stat}
            values={["Vacations", "Calendar"]}
          />
        </div>
        
        {/* Right: Date Section + Add Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button 
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-slate-50 hover:text-indigo-600 transition-all"
            >
              <IoIosArrowBack size={16} />
            </button>
            <span className="text-[11px] font-bold text-slate-600 min-w-[100px] text-center uppercase tracking-wide">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button 
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-slate-50 hover:text-indigo-600 transition-all"
            >
              <IoIosArrowForward size={16} />
            </button>
          </div>

          {canCreateVacationRequest && (
            <PrimaryButton
              icon={"/icons/add.svg"}
              title={"Add Request"}
              className={"px-5 text-white"}
              onclick={() => setShowRequestModal(true)}
            />
          )}
        </div>
      </div>
      {renderStat()}
      {showRequestModal && (
        <VacationRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </section>
  );
};

export default Vacations;
