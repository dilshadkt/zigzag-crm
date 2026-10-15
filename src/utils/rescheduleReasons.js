// Why a due date was moved decides who, if anyone, loses points.
// Keep in sync with crm-api/utils/rescheduleAccountability.js.
export const RESCHEDULE_REASONS = [
  {
    value: "staff_delay",
    label: "Staff Delay",
    description: "The assignee lost time and could not finish by the deadline.",
    penaltyNote: "Penalty applied to the assignee",
    penalized: true,
    selfService: true,
    tone: "red",
  },
  {
    value: "client_delay",
    label: "Client Delay / Missing Assets",
    description:
      "Client approval, content or photos were late, or the client asked for late changes.",
    penaltyNote: "No penalty",
    penalized: false,
    selfService: false,
    tone: "green",
  },
  {
    value: "internal_dependency",
    label: "Internal Dependency",
    description:
      "A colleague's earlier step (footage, script, design) was delivered late.",
    penaltyNote: "No penalty for the assignee; the penalty goes to the person who caused it",
    penalized: true,
    selfService: false,
    tone: "amber",
  },
  {
    value: "management_priority",
    label: "Priority Shift / Management Decision",
    description:
      "Admin or coordinator assigned urgent work, so this work had to move.",
    penaltyNote: "No penalty",
    penalized: false,
    selfService: false,
    tone: "blue",
  },
];

export const RESCHEDULE_REASON_LABELS = {
  ...Object.fromEntries(RESCHEDULE_REASONS.map((r) => [r.value, r.label])),
  unspecified: "Not specified",
};

const idOf = (value) => String(value?._id || value || "");

// Admins and the project's manager / reporters (the coordinators) may pick a
// reason that waives the assignee's penalty. Everyone else can only declare
// a staff delay against themselves.
export const canWaiveReschedulePenalty = (user, project) => {
  if (!user) return false;
  if (user.role === "company-admin") return true;
  if (!project || typeof project !== "object") return false;

  const userId = idOf(user._id || user.id);
  if (idOf(project.manager) === userId) return true;
  return (project.reporters || []).some((r) => idOf(r) === userId);
};

export const formatPenalty = (points) => (points > 0 ? `-${points} Pts` : "0 Pts");
