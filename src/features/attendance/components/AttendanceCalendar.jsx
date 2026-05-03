import React, { useState, useEffect } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../hooks/useAuth";
import { useAttendanceCalendarData } from "../hooks/useAttendanceCalendarData";
import AttendanceCalendarHeader from "./AttendanceCalendarHeader";
import AttendanceCalendarGrid from "./AttendanceCalendarGrid";
import {
  setCurrentDate as setCalendarCurrentDate,
  reloadCalendarState,
} from "../../../store/slice/calendarSlice";

const AttendanceCalendar = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentDate: persistedCurrentDate } = useSelector(
    (state) => state.calendar
  );

  // Reload calendar state when user changes to get user-specific persisted date
  useEffect(() => {
    if (user?._id) {
      dispatch(reloadCalendarState());
    }
  }, [user?._id, dispatch]);

  // Default to current month
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Set current date to current month on initial load
  useEffect(() => {
    if (user?._id) {
      dispatch(setCalendarCurrentDate(new Date().toISOString()));
    }
  }, [user?._id, dispatch]);

  // Fetch attendance data for the current month
  const { attendanceData, isLoading, getAttendanceForDate } =
    useAttendanceCalendarData(currentDate, user?._id);

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    dispatch(setCalendarCurrentDate(newDate.toISOString()));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    dispatch(setCalendarCurrentDate(newDate.toISOString()));
  };

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Calculate day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Generate blank days to fill the calendar grid properly
  const blankDays = Array(firstDayOfWeek)
    .fill(null)
    .map((_, index) => ({ day: "", date: "", fullDate: null }));

  // Days in the current month
  const calendarDays = [
    ...blankDays,
    ...daysInMonth.map((date) => ({
      day: format(date, "EEE"),
      date: format(date, "d"),
      fullDate: date,
    })),
  ];

  return (
    <section className="flex flex-col h-full">
      <div
        className="w-full h-full flex flex-col overflow-hidden
         bg-white rounded-3xl"
      >
        <div
          className="min-h-[48px] relative w-full flex items-center justify-center 
         border-b border-[#E6EBF5]"
        >
          {/* Calendar Header */}
          <AttendanceCalendarHeader
            currentDate={currentDate}
            firstDay={firstDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isLoading={isLoading}
          />
        </div>
        {/* Calendar Grid */}
        <AttendanceCalendarGrid
          calendarDays={calendarDays}
          getAttendanceForDate={getAttendanceForDate}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default AttendanceCalendar;

