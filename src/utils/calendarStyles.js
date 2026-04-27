// Priority color mapping for visual distinction
const priorityColors = {
  low: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    progress: "bg-emerald-400",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    progress: "bg-amber-400",
  },
  high: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
    progress: "bg-rose-400",
  },
};

// Status color mapping for tasks
const statusColors = {
  todo: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    dot: "bg-gray-500",
  },
  "in-progress": {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  "on-review": {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  "on-hold": {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  "re-work": {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  "client-approved": {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
};

// Colors for birthday items
const birthdayColors = {
  bg: "bg-purple-50",
  text: "text-purple-800",
  border: "border-purple-200",
  dot: "bg-purple-500",
};

// Colors for subtask items
const subtaskColors = {
  bg: "bg-green-50",
  text: "text-green-800",
  border: "border-green-200",
  dot: "bg-green-500",
};

// Colors for extra tasks (tasks without project)
const extraTaskColors = {
  bg: "bg-red-50",
  text: "text-red-800",
  border: "border-red-300",
  dot: "bg-indigo-500",
};

// Risk color mapping for at-risk tasks/subtasks
const riskColors = {
  overdue: {
    bg: "bg-red-50",
    text: "text-red-900",
    border: "border-red-400",
    dot: "bg-red-600",
  },
  near: {
    bg: "bg-orange-50",
    text: "text-orange-900",
    border: "border-orange-400",
    dot: "bg-orange-600",
  },
};

// Default color for projects with undefined priority
const defaultColor = {
  bg: "bg-blue-50",
  text: "text-blue-800",
  border: "border-blue-200",
  dot: "bg-blue-500",
  progress: "bg-blue-400",
};

/**
 * Check for due date risk and return style if applicable
 */
const getRiskStyle = (dueDate, status) => {
  if (!dueDate) return null;

  // Skip risk styling for completed/approved items
  if (["completed", "approved", "client-approved"].includes(status)) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return riskColors.overdue;
  if (diffDays <= 3) return riskColors.near;
  
  return null;
};

// Get appropriate styling based on priority
export const getProjectStyle = (priority) => {
  return priorityColors[priority?.toLowerCase()] || defaultColor;
};

// Get styling for tasks based on status and risk
export const getTaskStyle = (task) => {
  // 1. Check for due date risk (Highest priority styling)
  const riskStyle = getRiskStyle(task.dueDate, task.status);
  if (riskStyle) return riskStyle;

  // 2. Check if this is an extra task (no project)
  if (!task.project) {
    return extraTaskColors;
  }

  // 3. Status-based styling
  const statusStyle = statusColors[task.status] || statusColors.todo;

  // 4. Priority override (if no risk)
  if (task.priority?.toLowerCase() === "high") {
    return priorityColors.high;
  }

  return statusStyle;
};

// Get birthday styling
export const getBirthdayStyle = () => {
  return birthdayColors;
};

// Get subtask styling based on risk and project
export const getSubtaskStyle = (subtask) => {
  // 1. Check for due date risk
  const riskStyle = getRiskStyle(subtask.dueDate, subtask.status);
  if (riskStyle) return riskStyle;

  // 2. Extra subtask check
  if (subtask && !subtask.project) {
    return extraTaskColors;
  }

  // Default subtask style
  return subtaskColors;
};

// Get extra task styling
export const getExtraTaskStyle = () => {
  return extraTaskColors;
};
