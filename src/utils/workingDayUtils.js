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
 * Return the next working day on or after `date`.
 * Shifts forward (skipping off days) until a working day is found.
 * Safety cap: max 14 days forward to avoid infinite loops.
 * @param {Date} date
 * @param {Array} weeklyOffs
 * @returns {Date}  A new Date object (original is not mutated)
 */
export const nextWorkingDay = (date, weeklyOffs = []) => {
  if (!weeklyOffs || weeklyOffs.length === 0) return new Date(date);

  let d = new Date(date);
  let safety = 0;
  while (isWeeklyOff(d, weeklyOffs) && safety < 14) {
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
 * Core pipeline: take a task's start/due dates + flow steps + weeklyOffs,
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
export const computeFlowDatesWithSchedule = (
  taskStart,
  taskDue,
  flows,
  weeklyOffs = []
) => {
  if (!taskStart || !taskDue || !flows || flows.length === 0) return [];

  const rawTaskStart = new Date(taskStart);
  const rawTaskDue = new Date(taskDue);

  if (isNaN(rawTaskStart.getTime()) || isNaN(rawTaskDue.getTime())) return [];

  // Adjust task startDate if it falls on an off-day (cascade from first step)
  const adjustedTaskStart = nextWorkingDay(rawTaskStart, weeklyOffs);

  const weights = flows.map((s) => (s.weightage !== undefined ? s.weightage : 1));
  const totalWeightage = weights.reduce((sum, w) => sum + w, 0);

  const totalDays = Math.max(
    1,
    Math.ceil((rawTaskDue - adjustedTaskStart) / (1000 * 60 * 60 * 24))
  );

  // Proportional step durations (same algorithm as backend)
  const stepDurations = new Array(flows.length).fill(0);
  if (totalWeightage > 0) {
    let currentWeightSum = 0;
    let prevActualEnd = 0;
    for (let i = 0; i < flows.length; i++) {
      if (weights[i] > 0) {
        currentWeightSum += weights[i];
        const idealEnd = (currentWeightSum / totalWeightage) * totalDays;
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

    // Raw due date (no off-day consideration)
    const rawDue = new Date(currentDate);
    rawDue.setDate(rawDue.getDate() + stepDuration);

    // Clamp to task due date before adjusting
    const clampedRawDue = rawDue > rawTaskDue ? new Date(rawTaskDue) : rawDue;

    // Adjust to next working day
    const adjustedDue = nextWorkingDay(clampedRawDue, weeklyOffs);

    // Don't exceed task due date after adjustment either (keep clamped)
    const finalDue = adjustedDue > rawTaskDue ? new Date(rawTaskDue) : adjustedDue;

    const wasAdjusted =
      clampedRawDue.toDateString() !== finalDue.toDateString();

    result.push({
      index: i,
      taskName: step.taskName,
      assignee: step.assignee,
      weightage: step.weightage,
      startDate: new Date(stepStartDate),
      dueDate: new Date(finalDue),
      wasAdjusted,
      // The original day name that was skipped, for UI tooltip
      skippedDay: wasAdjusted
        ? clampedRawDue.toLocaleDateString("en-US", { weekday: "long" })
        : null,
    });

    // Cascade: next step starts where this one ends
    currentDate = new Date(finalDue);
  }

  return result;
};
