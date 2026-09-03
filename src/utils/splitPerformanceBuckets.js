/**
 * Split stored performance into display buckets so My Points / Scoring Guide
 * show rework, review delay, checklist, and leave deductions under Penalties
 * rather than netting them into Bonus.
 *
 * Stored formula is unchanged:
 *   total = activity + attendance - penaltyScore + bonusScore
 * where bonusScore already includes negative event rows.
 */
export const splitPerformanceBuckets = (performance) => {
  const activity = Number(performance?.activityScore) || 0;
  const attendance = Number(performance?.attendanceScore) || 0;
  const latePenalties = Number(performance?.penaltyScore) || 0;
  const history = Array.isArray(performance?.bonusHistory)
    ? performance.bonusHistory
    : [];

  if (history.length) {
    const bonus = history.reduce(
      (sum, row) => sum + Math.max(0, Number(row.points) || 0),
      0
    );
    const eventDeductions = history.reduce(
      (sum, row) => sum + Math.max(0, -(Number(row.points) || 0)),
      0
    );
    return {
      activity,
      attendance,
      bonus,
      penalties: latePenalties + eventDeductions,
    };
  }

  const netBonus = Number(performance?.bonusScore) || 0;
  return {
    activity,
    attendance,
    bonus: Math.max(0, netBonus),
    penalties: latePenalties + Math.max(0, -netBonus),
  };
};
