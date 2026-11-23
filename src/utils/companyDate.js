import { useEffect, useState } from "react";

/**
 * Calendar days the way the company (and the API) count them.
 *
 * The API stamps every attendance row with the Indian calendar day (midnight
 * Asia/Kolkata, e.g. 23 Nov is stored as 2026-11-22T18:30:00Z) and works out
 * "today" for tasks in the same zone. Reading those timestamps with the
 * browser's own zone makes 23 Nov show up as 22 Nov on any device that is not
 * on IST (a laptop on UTC, a phone abroad). And `toISOString().split("T")[0]`
 * is the UTC day, which is still "yesterday" until 05:30 IST.
 * Everything that needs a day should go through here instead.
 */
export const COMPANY_TIME_ZONE = "Asia/Kolkata";

const dayParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMPANY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "yyyy-MM-dd" of the company calendar day an instant falls on; "" if invalid. */
export const companyDayKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dayParts.format(date);
};

/** Today's company day, "yyyy-MM-dd". */
export const companyTodayKey = () => companyDayKey(new Date());

/** A day key as a local-midnight Date, for date-fns / calendar maths on the day itself. */
export const dayKeyToLocalDate = (key) => new Date(`${key}T00:00:00`);

/**
 * Drop-in for `new Date(record.date)` where only the day matters: a local
 * midnight Date for the company day, so date-fns `format` and `toDateString`
 * show the right calendar day on any device.
 */
export const companyDayDate = (value) => {
  const key = companyDayKey(value);
  return key ? dayKeyToLocalDate(key) : new Date(NaN);
};

const pad = (n) => String(n).padStart(2, "0");

/** A local Date's own calendar day as "yyyy-MM-dd" (no UTC shift). */
export const localDayKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Move a "yyyy-MM-dd" key by whole days. */
export const shiftDayKey = (key, days) => {
  const date = dayKeyToLocalDate(key);
  date.setDate(date.getDate() + days);
  return localDayKey(date);
};

/** First and last day of a company month; offset 0 = this month, -1 = last month. */
export const companyMonthRange = (offset = 0, today = companyTodayKey()) => {
  const [year, month] = today.split("-").map(Number);
  const first = new Date(year, month - 1 + offset, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  return { startDate: localDayKey(first), endDate: localDayKey(last) };
};

/** Format a stored day (e.g. attendance.date) for display, in the company zone. */
export const formatCompanyDay = (value, options = { month: "short", day: "numeric" }) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { ...options, timeZone: COMPANY_TIME_ZONE });
};

/**
 * Today's company day as React state. It rolls over by itself at midnight even
 * when the page (or the installed app) is left open overnight, so anything
 * keyed on it refetches instead of showing yesterday.
 */
export const useCompanyToday = () => {
  const [today, setToday] = useState(companyTodayKey);

  useEffect(() => {
    const sync = () => setToday((prev) => {
      const next = companyTodayKey();
      return next === prev ? prev : next;
    });
    const timer = setInterval(sync, 60 * 1000);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return today;
};
