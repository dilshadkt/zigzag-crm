// Schedule helpers shared by recurring work rules and checklist items.
// A schedule is { frequency: "daily" | "weekly" | "monthly", weekdays, monthDays }.
// weekdays use JS numbering (0 = Sunday); monthDays 0 means "last day of the month".

export const WEEKDAYS = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 0, short: "Sun", long: "Sunday" },
];

export const WORKWEEK = [1, 2, 3, 4, 5];

export const DEFAULT_SCHEDULE = { frequency: "weekly", weekdays: [1], monthDays: [1] };

// Older items stored a single `monthDay`; read it as a one-item list.
export const monthDaysOf = (schedule) => {
  if (Array.isArray(schedule?.monthDays) && schedule.monthDays.length) return schedule.monthDays;
  if (Number.isInteger(schedule?.monthDay)) return [schedule.monthDay];
  return [];
};

export const isScheduleValid = (schedule) => {
  if (!schedule) return false;
  if (schedule.frequency === "daily") return true;
  if (schedule.frequency === "weekly") return (schedule.weekdays || []).length > 0;
  if (schedule.frequency === "monthly") return monthDaysOf(schedule).length > 0;
  return false;
};

const ordinal = (n) => {
  const rem = n % 100;
  if (rem >= 11 && rem <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
};

// "Every day", "Mon, Thu", "Mon–Fri", "Monthly on the 1st, 15th"
export const describeSchedule = (schedule) => {
  if (!schedule || !schedule.frequency || schedule.frequency === "daily") return "Every day";

  if (schedule.frequency === "weekly") {
    const days = new Set(schedule.weekdays || []);
    if (days.size === 0) return "No days selected";
    if (days.size === 7) return "Every day";
    if (days.size === 5 && WORKWEEK.every((d) => days.has(d))) return "Mon–Fri";
    return WEEKDAYS.filter((d) => days.has(d.value))
      .map((d) => d.short)
      .join(", ");
  }

  if (schedule.frequency === "monthly") {
    const days = monthDaysOf(schedule);
    if (days.length === 0) return "No days selected";
    // Last day sorts after the numbered days
    const labels = [...days]
      .sort((a, b) => (a || 99) - (b || 99))
      .map((d) => (d === 0 ? "last day" : ordinal(d)));
    return `Monthly on the ${labels.join(", ")}`;
  }

  return "";
};

// Plain-object schedule for checklist items / rules (drops fields that don't apply).
export const normalizeSchedule = (schedule) => ({
  frequency: schedule.frequency,
  weekdays: schedule.frequency === "weekly" ? [...new Set(schedule.weekdays || [])].sort() : [],
  monthDays:
    schedule.frequency === "monthly"
      ? [...new Set(monthDaysOf(schedule))].sort((a, b) => (a || 99) - (b || 99))
      : [],
});
