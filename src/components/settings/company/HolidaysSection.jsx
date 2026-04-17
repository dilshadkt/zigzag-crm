import React, { useState } from "react";
import {
  FiTrash2,
  FiEdit3,
  FiCalendar,
  FiSun,
  FiGlobe,
  FiMapPin,
  FiBriefcase,
  FiStar,
} from "react-icons/fi";
import { format, parseISO } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeConfig = {
  national: {
    label: "National",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <FiGlobe className="w-3 h-3" />,
    dot: "bg-blue-500",
  },
  regional: {
    label: "Regional",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    icon: <FiMapPin className="w-3 h-3" />,
    dot: "bg-purple-500",
  },
  company: {
    label: "Company",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: <FiBriefcase className="w-3 h-3" />,
    dot: "bg-green-500",
  },
  optional: {
    label: "Optional",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    icon: <FiStar className="w-3 h-3" />,
    dot: "bg-orange-400",
  },
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Group holidays by month
const groupByMonth = (holidays) => {
  const groups = {};
  holidays.forEach((h) => {
    const d = new Date(h.date);
    const key = d.getUTCMonth(); // 0–11
    if (!groups[key]) groups[key] = [];
    groups[key].push(h);
  });
  return groups;
};

// ─── HolidayCard ──────────────────────────────────────────────────────────────

const HolidayCard = ({ holiday, onEdit, onDelete }) => {
  const d = new Date(holiday.date);
  const day = d.getUTCDate();
  const weekday = d.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  const cfg = typeConfig[holiday.type] || typeConfig.company;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-all duration-150 group border-b border-gray-50 last:border-0">
      {/* Day Badge */}
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex flex-col items-center justify-center shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
        <span className="text-white text-[13px] font-black leading-none">
          {day}
        </span>
        <span className="text-indigo-100 text-[8px] font-bold uppercase leading-none mt-0.5">
          {weekday}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-bold text-gray-800 truncate">
            {holiday.name}
          </span>
          {holiday.isRecurring && (
            <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-tight">
              Recurring
            </span>
          )}
        </div>
        {holiday.description && (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {holiday.description}
          </p>
        )}
      </div>

      {/* Type badge */}
      <div
        className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-tight flex-shrink-0 ${cfg.color}`}
      >
        {cfg.icon}
        {cfg.label}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(holiday)}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="Edit holiday"
        >
          <FiEdit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(holiday)}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Delete holiday"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── HolidaysSection ──────────────────────────────────────────────────────────

const HolidaysSection = ({ holidays, isLoading, error, onEdit, onDelete, selectedYear, onYearChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-[13px] font-medium text-gray-400">
          Loading holidays…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <FiTrash2 className="text-red-500 w-5 h-5" />
        </div>
        <h3 className="text-[14px] font-bold text-red-900 mb-1">
          Failed to load holidays
        </h3>
        <p className="text-[12px] text-red-600/70 max-w-xs">{error.message}</p>
      </div>
    );
  }

  const list = holidays || [];
  const grouped = groupByMonth(list);
  const monthKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  // Stats for footer
  const typeCounts = list.reduce((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Year filter */}
      <div className="flex items-center gap-2">
        <FiCalendar className="w-4 h-4 text-gray-400" />
        <span className="text-[12px] font-semibold text-gray-500">Year:</span>
        <div className="flex items-center gap-1">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedYear === y
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed px-6 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <FiSun className="w-6 h-6 text-indigo-300" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-800 mb-1">
            No Holidays for {selectedYear}
          </h3>
          <p className="text-[12px] text-gray-500 max-w-xs">
            Add the days your company will be closed so employees know in advance.
          </p>
        </div>
      ) : (
        <>
          {/* Month groups */}
          {monthKeys.map((month) => (
            <div
              key={month}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Month header */}
              <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <h4 className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">
                    {monthNames[month]}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                  {grouped[month].length}{" "}
                  {grouped[month].length === 1 ? "day" : "days"}
                </span>
              </div>

              {/* Holiday rows */}
              {grouped[month].map((holiday) => (
                <HolidayCard
                  key={holiday._id}
                  holiday={holiday}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ))}

          {/* Footer stats */}
          <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Total: {list.length} holiday{list.length !== 1 ? "s" : ""} in{" "}
              {selectedYear}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(typeCounts).map(([type, count]) => {
                const cfg = typeConfig[type] || typeConfig.company;
                return (
                  <div key={type} className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {count} {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HolidaysSection;
