import React from "react";
import {
  WEEKDAYS,
  WORKWEEK,
  DEFAULT_SCHEDULE,
  describeSchedule,
  monthDaysOf,
} from "./recurrence";

const selectClass =
  "bg-white px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/**
 * Controlled schedule picker.
 *   value    { frequency, weekdays, monthDays }  (frequency "none" when allowNone)
 *   onChange receives the next schedule object
 */
const RecurrenceFields = ({ value, onChange, disabled = false, allowNone = false }) => {
  const schedule = value || DEFAULT_SCHEDULE;
  const frequency = schedule.frequency || (allowNone ? "none" : "daily");
  const weekdays = schedule.weekdays || [];
  const monthDays = monthDaysOf(schedule);

  const update = (patch) => onChange({ ...schedule, ...patch });

  const handleFrequency = (next) => {
    if (next === "weekly" && weekdays.length === 0) {
      update({ frequency: next, weekdays: [DEFAULT_SCHEDULE.weekdays[0]] });
    } else if (next === "monthly" && monthDays.length === 0) {
      update({ frequency: next, monthDays: DEFAULT_SCHEDULE.monthDays });
    } else {
      update({ frequency: next });
    }
  };

  const toggleMonthDay = (day) => {
    const next = monthDays.includes(day)
      ? monthDays.filter((d) => d !== day)
      : [...monthDays, day];
    // Drop the legacy single-day field so it can't override the list
    update({ monthDays: next, monthDay: undefined });
  };

  const toggleWeekday = (day) => {
    const next = weekdays.includes(day)
      ? weekdays.filter((d) => d !== day)
      : [...weekdays, day];
    update({ weekdays: next });
  };

  const isWorkweek =
    weekdays.length === WORKWEEK.length && WORKWEEK.every((d) => weekdays.includes(d));

  return (
    <div className="flex flex-col gap-3">
      <select
        value={frequency}
        disabled={disabled}
        onChange={(e) => handleFrequency(e.target.value)}
        className={`${selectClass} w-full sm:w-56`}
      >
        {allowNone && <option value="none">Don&apos;t repeat</option>}
        <option value="daily">Every day</option>
        <option value="weekly">On specific weekdays</option>
        <option value="monthly">Once a month</option>
      </select>

      {frequency === "weekly" && (
        <div className="flex flex-wrap items-center gap-2">
          {WEEKDAYS.map((day) => {
            const selected = weekdays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                disabled={disabled}
                title={day.long}
                aria-pressed={selected}
                onClick={() => toggleWeekday(day.value)}
                className={`h-9 min-w-[44px] rounded-full border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {day.short}
              </button>
            );
          })}
          <button
            type="button"
            disabled={disabled}
            onClick={() => update({ weekdays: isWorkweek ? [] : WORKWEEK })}
            className="ml-1 text-xs font-medium text-blue-600 hover:underline disabled:opacity-60"
          >
            {isWorkweek ? "Clear" : "Mon–Fri"}
          </button>
        </div>
      )}

      {frequency === "monthly" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">
            Pick the days of the month. For example 1, 8, 15 and 22 gives exactly four a month.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MONTH_DAYS.map((day) => {
              const selected = monthDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => toggleMonthDay(day)}
                  className={`h-8 w-9 rounded-lg border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
            <button
              type="button"
              disabled={disabled}
              aria-pressed={monthDays.includes(0)}
              onClick={() => toggleMonthDay(0)}
              className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                monthDays.includes(0)
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Last day
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Short months use their last day for days like 30 or 31.
          </p>
        </div>
      )}

      {frequency === "weekly" && weekdays.length === 0 && (
        <p className="text-xs text-red-500">Pick at least one weekday.</p>
      )}
      {frequency === "monthly" && monthDays.length === 0 && (
        <p className="text-xs text-red-500">Pick at least one day of the month.</p>
      )}
      {frequency !== "none" &&
        (frequency !== "weekly" || weekdays.length > 0) &&
        (frequency !== "monthly" || monthDays.length > 0) && (
        <p className="text-xs text-gray-500">{describeSchedule({ ...schedule, frequency })}</p>
      )}
    </div>
  );
};

export default RecurrenceFields;
