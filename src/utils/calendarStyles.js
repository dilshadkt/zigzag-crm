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

// Default color for projects with undefined priority
const defaultColor = {
  bg: "bg-blue-50",
  text: "text-blue-800",
  border: "border-blue-200",
  dot: "bg-blue-500",
  progress: "bg-blue-400",
};

// Get appropriate styling based on priority
export const getProjectStyle = (priority) => {
  return priorityColors[priority?.toLowerCase()] || defaultColor;
};

// Get styling for tasks based on status
export const getTaskStyle = (task) => {
  // Check if this is an extra task (no project)
  if (!task.project) {
    return extraTaskColors;
  }

  // First try to get style by status
  const statusStyle = statusColors[task.status] || statusColors.todo;

  // If high priority, override with priority color
  if (task.priority?.toLowerCase() === "high") {
    return priorityColors.high;
  }

  return statusStyle;
};

// Get birthday styling
export const getBirthdayStyle = () => {
  return birthdayColors;
};

// Get subtask styling
export const getSubtaskStyle = (subtask) => {
  // Check if this is an extra subtask (no project)
  if (subtask && !subtask.project) {
    return extraTaskColors;
  }
  return subtaskColors;
};

// Get extra task styling
export const getExtraTaskStyle = () => {
  return extraTaskColors;
};
