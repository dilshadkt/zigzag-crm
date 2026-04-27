import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  isSameDay,
  addDays,
  isAfter,
  isBefore,
} from "date-fns";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const ModifyDatesModal = ({ isOpen, onClose, request, onSave }) => {
  const [formData, setFormData] = useState({
    startDate: format(new Date(request?.startDate || new Date()), "yyyy-MM-dd"),
    endDate: format(new Date(request?.endDate || new Date()), "yyyy-MM-dd"),
    notes: request?.notes || "",
  });
  const [selectionMode, setSelectionMode] = useState("start");
  const [currentMonth, setCurrentMonth] = useState(
    new Date(request?.startDate || new Date())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(request?.type || "vacation");

  useEffect(() => {
    setFormData({
      startDate: format(new Date(request?.startDate || new Date()), "yyyy-MM-dd"),
      endDate: format(new Date(request?.endDate || new Date()), "yyyy-MM-dd"),
      notes: request?.notes || "",
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
        notes: formData.notes,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all">
      <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-xl shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in duration-200 overflow-visible">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Modify Request</h2>
            <p className="text-xs text-slate-400 font-medium">Adjust dates or type for this request.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 bg-slate-50 p-2 rounded-xl transition-all"
          >
            <RxCross2 size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          {/* Calendar Section */}
          <div className="flex-1 min-w-[280px]">
             <div className="flex justify-between items-center mb-4 px-1">
              <button type="button" onClick={previousMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"><IoIosArrowBack size={16} /></button>
              <h3 className="font-bold text-slate-700 text-sm tracking-tight">{getMonthName()}</h3>
              <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"><IoIosArrowForward size={16} /></button>
            </div>

            <div className="grid grid-cols-7 text-center gap-y-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-[10px] font-bold text-slate-300 mb-2">{day}</div>
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
                      h-9 w-full relative flex items-center justify-center text-xs font-bold cursor-pointer transition-all
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
            
            <div className="mt-4 flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Range</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {format(new Date(formData.startDate), "MMM dd")} — {format(new Date(formData.endDate), "MMM dd")}
              </span>
            </div>
          </div>

          {/* Settings Section */}
          <div className="w-full md:w-[240px] flex flex-col">
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {['vacation', 'sick_leave', 'remote_work'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all capitalize text-left
                        ${selectedType === type 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100"
                        }`}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Admin Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes for employee..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none min-h-[100px] resize-none font-medium text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-4 text-xs font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-indigo-100"
            >
              {isSubmitting ? "Updating..." : "Update Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyDatesModal;
