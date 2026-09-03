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

export const getProbationTrack = (employee) => {
  if (!employee) return null;
  if (employee.probationTrack) return employee.probationTrack;

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
  const endDate = employee.probationEndDate
    ? new Date(employee.probationEndDate)
    : originalEndDate;
  const today = startOfDay(new Date());

  return {
    isOnProbation: Boolean(employee.isOnProbation),
    createdAt,
    joiningDate,
    startDate,
    originalPeriodMonths,
    originalEndDate,
    endDate,
    remainingDays: endDate ? diffDays(endDate, today) : null,
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
        endDate &&
        today.getTime() > startOfDay(endDate).getTime()
    ),
    extensions: employee.probationExtensions || [],
  };
};
