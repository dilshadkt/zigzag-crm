export const isOnProbation = (employee) => Boolean(employee?.isOnProbation);

const findPolicyQuota = (policy, id, nameIncludes, fallback) => {
  const item = (policy || []).find(
    (p) => p.id === id || p.name?.toLowerCase().includes(nameIncludes)
  );
  return item?.yearlyQuota ?? fallback;
};

const pickQuota = (customValue, fallback) => {
  if (customValue === null || customValue === undefined || customValue === "") {
    return fallback;
  }
  const numeric = Number(customValue);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const getLeaveLimits = (employee, leavePolicy = []) => {
  if (isOnProbation(employee)) {
    return { vacation: 0, sick_leave: 0, remote_work: 0 };
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
  };
};

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
