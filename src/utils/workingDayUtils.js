/**
 * workingDayUtils.js
 *
 * Pure calendar utilities for working-day calculation.
 * No framework dependencies — safe to use in any context.
 *
 * WeeklyOff rule shape:
 *   { day: 0-6, occurrence: "all"|"first"|"second"|"third"|"fourth"|"last" }
 *   day values: 0=Sunday, 1=Monday … 6=Saturday
 */

const OCCURRENCE_MAP = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
};

/**
 * How many days are in a given month?
 * @param {number} year
 * @param {number} month  0-indexed (0 = January)
 */
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/**
 * Which occurrence (1st, 2nd, 3rd…) is this weekday within its month?
 * e.g. the 2nd Sunday → 2
 * @param {Date} date
 * @returns {number}
 */
export const getNthOccurrenceInMonth = (date) => {
  return Math.ceil(date.getDate() / 7);
};

/**
 * Is this the LAST occurrence of this weekday in its month?
 * e.g. "last Sunday" of April
 * @param {Date} date
 * @returns {boolean}
 */
export const isLastOccurrenceInMonth = (date) => {
  const dim = daysInMonth(date.getFullYear(), date.getMonth());
  return date.getDate() + 7 > dim;
};

/**
 * Check whether a given date matches any of the weekly-off rules.
 * @param {Date} date
 * @param {Array<{day: number, occurrence: string}>} weeklyOffs
 * @returns {boolean}
 */
export const isWeeklyOff = (date, weeklyOffs = []) => {
  if (!weeklyOffs || weeklyOffs.length === 0) return false;

  const dayOfWeek = date.getDay(); // 0-6

  for (const rule of weeklyOffs) {
    if (rule.day !== dayOfWeek) continue;

    if (rule.occurrence === "all") return true;

    if (rule.occurrence === "last") {
      if (isLastOccurrenceInMonth(date)) return true;
      continue;
    }

    const expectedNth = OCCURRENCE_MAP[rule.occurrence];
    if (expectedNth !== undefined && getNthOccurrenceInMonth(date) === expectedNth) {
      return true;
    }
  }

  return false;
};

/**
 * Check whether a given date is a company holiday.
 * @param {Date} date
 * @param {Array<{date: string|Date, active: boolean}>} holidays
 * @returns {boolean}
 */
export const isHoliday = (date, holidays = []) => {
  if (!holidays || holidays.length === 0) return false;

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dTime = d.getTime();

  return holidays.some((h) => {
    if (h.active === false) return false;
    const hDate = new Date(h.date);
    hDate.setHours(0, 0, 0, 0);
    return hDate.getTime() === dTime;
  });
};

/**
 * Combined check for weekly-off and holidays.
 */
export const isOffDay = (date, weeklyOffs = [], holidays = []) => {
  return isWeeklyOff(date, weeklyOffs) || isHoliday(date, holidays);
};

/**
 * Return the next working day on or after `date`.
 * Shifts forward (skipping off days) until a working day is found.
 * Safety cap: max 14 days forward to avoid infinite loops.
 * @param {Date} date
 * @param {Array} weeklyOffs
 * @param {Array} holidays
 * @returns {Date}  A new Date object (original is not mutated)
 */
export const nextWorkingDay = (date, weeklyOffs = [], holidays = []) => {
  let d = new Date(date);
  let safety = 0;
  while (isOffDay(d, weeklyOffs, holidays) && safety < 14) {
    d = new Date(d);
    d.setDate(d.getDate() + 1);
    safety++;
  }
  return d;
};

/**
 * Format a Date to "Mon Apr 21" style (for UI display).
 * @param {Date} date
 * @returns {string}
 */
export const formatShortDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/**
 * Determine the color for a due date based on its proximity to the current date.
 * - Green: More than 3 days in the future
 * - Orange: Within 3 days of due date
 * - Red: Overdue
 * @param {string|Date} dueDate
 * @param {string} status - Optional task status
 * @returns {string} Tailwind color class
 */
export const getDueDateColor = (dueDate, status) => {
  if (!dueDate) return "";

  // If task is completed or approved, show default color
  if (status === "completed" || status === "approved" || status === "client-approved") {
    return "";
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "text-red-600 font-semibold"; // Overdue
  if (diffDays <= 3) return "text-orange-600 font-semibold"; // Deadline close
  return "text-green-600 font-semibold"; // Far
};

/**
 * Core pipeline: take a task's start/due dates + flow steps + weeklyOffs + holidays,
 * and return adjusted per-step date ranges.
 *
 * Algorithm:
 *  1. Adjust the task's own startDate to the next working day if needed.
 *  2. Compute proportional raw durations (same logic as the backend).
 *  3. For each step:
 *     a. step.startDate = currentDate (already a working day from previous iteration)
 *     b. step.rawDueDate = currentDate + stepDuration
 *     c. step.dueDate = nextWorkingDay(rawDueDate)
 *     d. currentDate = step.dueDate  (cascade shift)
 *     e. Mark wasAdjusted if rawDueDate !== dueDate
 *
 * @param {string|Date} taskStart   Task start date
 * @param {string|Date} taskDue     Task due date
 * @param {Array<{taskName, assignee, weightage}>} flows  Flow steps
 * @param {Array} weeklyOffs        Company weekly-off rules
 * @param {Array} holidays          Company holidays
 * @returns {Array<{
 *   index: number,
 *   taskName: string,
 *   assignee: object|string,
 *   startDate: Date,
 *   dueDate: Date,
 *   wasAdjusted: boolean,
 *   adjustedDay: string|null,
 * }>}
 */
const getWorkingDaysCount = (start, end, weeklyOffs, holidays) => {
  let count = 0;
  let curr = new Date(start);
  curr.setHours(0, 0, 0, 0);
  const endT = new Date(end);
  endT.setHours(0, 0, 0, 0);
  let safety = 0;
  while (curr < endT && safety < 1000) {
    if (!isOffDay(curr, weeklyOffs, holidays)) count++;
    curr.setDate(curr.getDate() + 1);
    safety++;
  }
  return count;
};

const addWorkingDays = (start, days, weeklyOffs, holidays) => {
  let curr = new Date(start);
  curr.setHours(0, 0, 0, 0);
  let daysToAdd = days;
  let safety = 0;
  while (daysToAdd > 0 && safety < 1000) {
    curr.setDate(curr.getDate() + 1);
    if (!isOffDay(curr, weeklyOffs, holidays)) {
      daysToAdd--;
    }
    safety++;
  }
  return curr;
};

export const computeFlowDatesWithSchedule = (
  taskStart,
  taskDue,
  flows,
  weeklyOffs = [],
  holidays = []
) => {
  if (!taskStart || !taskDue || !flows || flows.length === 0) return [];

  const rawTaskStart = new Date(taskStart);
  const rawTaskDue = new Date(taskDue);

  if (isNaN(rawTaskStart.getTime()) || isNaN(rawTaskDue.getTime())) return [];

  // Adjust task startDate if it falls on an off-day (cascade from first step)
  const adjustedTaskStart = nextWorkingDay(rawTaskStart, weeklyOffs, holidays);

  const weights = flows.map((s) => (s.weightage !== undefined ? s.weightage : 1));
  const totalWeightage = weights.reduce((sum, w) => sum + w, 0);

  const totalWorkingDays = Math.max(
    1,
    getWorkingDaysCount(adjustedTaskStart, rawTaskDue, weeklyOffs, holidays)
  );

  // Proportional step durations (using working days)
  const stepDurations = new Array(flows.length).fill(0);
  if (totalWeightage > 0) {
    let currentWeightSum = 0;
    let prevActualEnd = 0;
    for (let i = 0; i < flows.length; i++) {
      if (weights[i] > 0) {
        currentWeightSum += weights[i];
        const idealEnd = (currentWeightSum / totalWeightage) * totalWorkingDays;
        const actualEnd = Math.round(idealEnd);
        stepDurations[i] = Math.max(0, actualEnd - prevActualEnd);
        prevActualEnd = actualEnd;
      }
    }
  }

  const result = [];
  let currentDate = new Date(adjustedTaskStart);

  for (let i = 0; i < flows.length; i++) {
    const step = flows[i];
    const stepDuration = stepDurations[i];

    const stepStartDate = new Date(currentDate);

    // Compute due date by adding working days
    const rawDue = addWorkingDays(currentDate, stepDuration, weeklyOffs, holidays);

    // Clamp to task due date to ensure we never exceed the parent deadline
    let finalDue = rawDue > rawTaskDue ? new Date(rawTaskDue) : rawDue;
    
    // Force the very last subtask to end exactly on the task's due date
    if (i === flows.length - 1) {
      finalDue = new Date(rawTaskDue);
    }

    // Check if the exact day was shifted due to holiday or weekend
    const wasAdjusted =
      isOffDay(rawDue, weeklyOffs, holidays) || finalDue.toDateString() !== rawDue.toDateString();

    let skippedDayType = null;
    let skippedDayName = null;

    if (wasAdjusted && rawDue <= rawTaskDue) {
      if (isHoliday(rawDue, holidays)) {
        const holiday = holidays.find(h => {
          const d1 = new Date(h.date);
          const d2 = new Date(rawDue);
          d1.setHours(0,0,0,0);
          d2.setHours(0,0,0,0);
          return d1.getTime() === d2.getTime();
        });
        skippedDayType = 'Holiday';
        skippedDayName = holiday ? holiday.name : 'Holiday';
      } else if (isWeeklyOff(rawDue, weeklyOffs)) {
        skippedDayType = 'Weekly Off';
        skippedDayName = rawDue.toLocaleDateString("en-US", { weekday: "long" });
      }
    }

    result.push({
      index: i,
      taskName: step.taskName,
      assignee: step.assignee,
      weightage: step.weightage,
      startDate: new Date(stepStartDate),
      dueDate: new Date(finalDue),
      wasAdjusted,
      skippedDay: skippedDayName,
      skippedDayType: skippedDayType
    });

    // Cascade: next step starts where this one ends
    currentDate = new Date(finalDue);
  }

  return result;
};
