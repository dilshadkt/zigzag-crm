import React, { useState } from "react";
import { useCreateVacationRequest } from "../../api/hooks";
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

const VacationRequestModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    type: "vacation",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    project: "",
  });
  const [selectionMode, setSelectionMode] = useState("start"); // "start" or "end"
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const createVacationMutation = useCreateVacationRequest();

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

    try {
      await createVacationMutation.mutateAsync({
        ...formData,
        // Convert dates to ISO format
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        // Add an empty reason since we removed the field but API still expects it
        reason: "",
        // Only include project if one is selected
        project: formData.project || undefined,
      });

      // Close modal after successful submission
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

  // Check if a date is the start or end of the range
  const isRangeEndpoint = (date) => {
    return isStartDate(date) || isEndDate(date);
  };

  return (
    <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Add Request</h2>
          <button
            onClick={onClose}
            className="text-gray-500 bg-[#F4F9FD] rounded-lg 
            flex items-center justify-center w-[40px] h-[40px] cursor-pointer hover:text-gray-700"
          >
            <RxCross2 size={18} className="text-gray-800" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Request Type Radio Buttons */}
          <div className="mb-4">
            <div className="flex gap-3 mb-4">
              <div
                className={`flex-1 border rounded-md p-2 cursor-pointer
                  h-fit  border-[#D8E0F0] ${
                    formData.type === "vacation"
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                onClick={() => handleTypeChange("vacation")}
              >
                <label className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="vacation"
                    checked={formData.type === "vacation"}
                    onChange={handleChange}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium ">Vacation</span>
                </label>
              </div>

              <div
                className={`flex-1 border rounded-md p-2 cursor-pointer
                  h-fit border-[#D8E0F0] ${
                    formData.type === "sick_leave"
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                onClick={() => handleTypeChange("sick_leave")}
              >
                <label className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="sick_leave"
                    checked={formData.type === "sick_leave"}
                    onChange={handleChange}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium ">Sick Leave</span>
                </label>
              </div>

              <div
                className={`flex-1 border rounded-md p-2 cursor-pointer
                  h-fit border-[#D8E0F0] ${
                    formData.type === "remote_work"
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                onClick={() => handleTypeChange("remote_work")}
              >
                <label className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="remote_work"
                    checked={formData.type === "remote_work"}
                    onChange={handleChange}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium whitespace-nowrap ">
                    Work remotely
                  </span>
                </label>
              </div>
            </div>
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

            <div className="grid grid-cols-7  text-center">
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

          {/* Error message */}
          {submitError && (
            <div className="mb-4 text-red-500 text-sm">{submitError}</div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-3 text-sm font-medium text-white bg-[#3F8CFF] 
              rounded-xl hover:bg-[#3F8CFF]/90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationRequestModal;
