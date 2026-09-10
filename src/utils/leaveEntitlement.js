export const DEFAULT_PROBATION_MONTHS = 3;
export const UNPAID_LEAVE_TYPE = "unpaid_leave";
export const PAID_LEAVE_TYPES = ["vacation", "sick_leave", "remote_work"];

export const isOnProbation = (employee) => Boolean(employee?.isOnProbation);

const findPolicyQuota = (policy, id, nameIncludes, fallback) => {
  const item = (policy || []).find(
    (p) => p.id === id || p.name?.toLowerCase().includes(nameIncludes)
  );
  if (!item) return fallback;
  return item.yearlyQuota ?? fallback;
};

const findPolicyType = (policy, id, nameIncludes) =>
  (policy || []).find(
    (p) => p.id === id || p.name?.toLowerCase().includes(nameIncludes)
  ) || null;

const pickQuota = (customValue, fallback) => {
  if (customValue === null || customValue === undefined || customValue === "") {
    return fallback;
  }
  const numeric = Number(customValue);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const getUnpaidLimit = (employee, leavePolicy = []) => {
  const custom = employee?.leaveQuotas?.unpaid_leave;
  if (custom !== null && custom !== undefined && custom !== "") {
    const numeric = Number(custom);
    return Number.isFinite(numeric) ? numeric : null;
  }
  const policyQuota = findPolicyQuota(leavePolicy, "unpaid", "unpaid", null);
  if (policyQuota === null || policyQuota === undefined || policyQuota === 0) {
    return null;
  }
  return policyQuota;
};

export const getLeaveLimits = (employee, leavePolicy = []) => {
  const unpaidLeave = getUnpaidLimit(employee, leavePolicy);

  if (isOnProbation(employee)) {
    return {
      vacation: 0,
      sick_leave: 0,
      remote_work: 0,
      unpaid_leave: unpaidLeave,
    };
  }

  const custom = employee?.leaveQuotas || {};

  return {
    vacation: pickQuota(
      custom.vacation,
      findPolicyQuota(leavePolicy, "casual", "casual", 16)
    ),
    sick_leave: pickQuota(
      custom.sick_leave,
      findPolicyQuota(leavePolicy, "sick", "sick", 12)
    ),
    remote_work: pickQuota(
      custom.remote_work,
      findPolicyQuota(leavePolicy, "unpaid", "unpaid", 50)
    ),
    unpaid_leave: unpaidLeave,
  };
};

export const isPaidLeaveType = (type) => PAID_LEAVE_TYPES.includes(type);

export const formatJoiningDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatLeaveBalance = (remaining, limit) => {
  if (limit === null || limit === undefined) return "Unlimited";
  return `${remaining}/${limit} days available`;
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addMonths = (value, months) => {
  const amount = Number(months) || 0;
  if (!value || !amount) return value ? new Date(value) : null;
  const date = new Date(value);
  const day = date.getDate();
  date.setMonth(date.getMonth() + amount);
  if (date.getDate() < day) date.setDate(0);
  return date;
};

const diffDays = (later, earlier) => {
  if (!later || !earlier) return null;
  return Math.round(
    (startOfDay(later).getTime() - startOfDay(earlier).getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

const remainingMonthsInclusive = (fromDate) => 12 - fromDate.getMonth();

const remainingQuartersInclusive = (fromDate) => {
  const quarter = Math.floor(fromDate.getMonth() / 3) + 1;
  return 5 - quarter;
};

const remainingHalvesInclusive = (fromDate) =>
  fromDate.getMonth() < 6 ? 2 : 1;

const roundHalf = (value) => Math.round(Number(value) * 2) / 2;

export const prorateYearlyQuota = (yearlyQuota, distribution, fromDate) => {
  const quota = Number(yearlyQuota);
  if (!Number.isFinite(quota) || quota <= 0) return 0;
  if (!fromDate) return roundHalf(quota);

  const from = startOfDay(fromDate);
  const dist = distribution || "none";
  let amount = 0;

  if (dist === "monthly") {
    amount = (quota / 12) * remainingMonthsInclusive(from);
  } else if (dist === "quarterly") {
    amount = (quota / 4) * remainingQuartersInclusive(from);
  } else if (dist === "half-yearly") {
    amount = (quota / 2) * remainingHalvesInclusive(from);
  } else {
    const year = from.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const totalDays = diffDays(yearEnd, yearStart) + 1;
    const remainingDays = Math.max(0, diffDays(yearEnd, from) + 1);
    amount = quota * (remainingDays / totalDays);
  }

  return roundHalf(Math.max(0, amount));
};

export const calculateLeaveQuotasFromProbationEnd = (
  policy = [],
  fromDate = new Date()
) => {
  const casual = findPolicyType(policy, "casual", "casual");
  const sick = findPolicyType(policy, "sick", "sick");
  const unpaid = findPolicyType(policy, "unpaid", "unpaid");
  const from = startOfDay(fromDate || new Date());

  const vacation = prorateYearlyQuota(
    casual?.yearlyQuota ?? 12,
    casual?.distribution || "monthly",
    from
  );
  const sickLeave = prorateYearlyQuota(
    sick?.yearlyQuota ?? 8,
    sick?.distribution || "quarterly",
    from
  );

  const unpaidQuota = Number(unpaid?.yearlyQuota);
  const unpaidLeave =
    !Number.isFinite(unpaidQuota) || unpaidQuota <= 0
      ? null
      : prorateYearlyQuota(unpaidQuota, unpaid?.distribution || "none", from);

  return {
    vacation,
    sick_leave: sickLeave,
    remote_work: null,
    unpaid_leave: unpaidLeave,
    meta: {
      fromDate: from.toISOString(),
      year: from.getFullYear(),
      breakdown: [
        {
          id: "casual",
          name: casual?.name || "Casual Leave",
          employeeKey: "vacation",
          yearlyQuota: casual?.yearlyQuota ?? 12,
          distribution: casual?.distribution || "monthly",
          granted: vacation,
        },
        {
          id: "sick",
          name: sick?.name || "Sick Leave",
          employeeKey: "sick_leave",
          yearlyQuota: sick?.yearlyQuota ?? 8,
          distribution: sick?.distribution || "quarterly",
          granted: sickLeave,
        },
        {
          id: "unpaid",
          name: unpaid?.name || "Unpaid Leave",
          employeeKey: "unpaid_leave",
          yearlyQuota: unpaid?.yearlyQuota ?? 0,
          distribution: unpaid?.distribution || "none",
          granted: unpaidLeave,
        },
      ],
    },
  };
};

export const getProbationTrack = (employee) => {
  if (!employee) return null;

  const createdAt = employee.createdAt ? new Date(employee.createdAt) : null;
  const joiningDate = employee.joiningDate
    ? new Date(employee.joiningDate)
    : createdAt;
  const startDate = employee.probationStartDate
    ? new Date(employee.probationStartDate)
    : joiningDate;
  const originalPeriodMonths =
    Number(employee.probationPeriodMonths) > 0
      ? Number(employee.probationPeriodMonths)
      : DEFAULT_PROBATION_MONTHS;
  const originalEndDate = startDate
    ? addMonths(startDate, originalPeriodMonths)
    : null;
  const scheduledEndDate = employee.probationEndDate
    ? new Date(employee.probationEndDate)
    : originalEndDate;
  const closedAt = employee.probationClosedAt
    ? new Date(employee.probationClosedAt)
    : null;
  const endDate = closedAt || scheduledEndDate;
  const today = startOfDay(new Date());
  const hasProbationHistory = Boolean(
    employee.isOnProbation ||
      closedAt ||
      employee.probationStartDate ||
      employee.probationEndDate ||
      (employee.probationExtensions || []).length
  );

  return {
    isOnProbation: Boolean(employee.isOnProbation),
    hasProbationHistory,
    isCompleted:
      Boolean(closedAt) || (!employee.isOnProbation && hasProbationHistory),
    createdAt,
    joiningDate,
    startDate,
    originalPeriodMonths,
    originalEndDate,
    scheduledEndDate,
    closedAt,
    endDate,
    closeReason: employee.probationCloseReason || "",
    remainingDays: scheduledEndDate
      ? diffDays(scheduledEndDate, today)
      : null,
    elapsedDays:
      startDate != null
        ? Math.max(0, diffDays(today, startOfDay(startDate)))
        : null,
    totalDays:
      startDate && endDate
        ? Math.max(1, diffDays(startOfDay(endDate), startOfDay(startDate)))
        : null,
    isExpired: Boolean(
      employee.isOnProbation &&
        scheduledEndDate &&
        today.getTime() > startOfDay(scheduledEndDate).getTime()
    ),
    extensions: employee.probationExtensions || [],
  };
};
