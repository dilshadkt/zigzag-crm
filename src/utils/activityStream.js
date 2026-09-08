const toDateKey = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getActivityUserName = (user) => {
  if (!user) return "Unknown user";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (user.email) return user.email;
  return "Unknown user";
};

export const getActivityUserInitial = (user) => {
  const name = getActivityUserName(user);
  return name === "Unknown user" ? "?" : name.charAt(0).toUpperCase();
};

export const formatActivityDate = (value) => {
  const key = toDateKey(value);
  if (!key) return "Not set";
  const [year, month, day] = key.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );
};

export const formatActivityValue = (value, changeType) => {
  if (value === null || value === undefined || value === "") return "Not set";
  if (changeType === "due_date_change") return formatActivityDate(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "string" || typeof item === "number") return String(item);
        const name = [item.firstName, item.lastName].filter(Boolean).join(" ");
        return name || item.title || item.name || "";
      })
      .filter(Boolean)
      .join(", ") || "Updated";
  }

  if (typeof value === "object") {
    const name = [value.firstName, value.lastName].filter(Boolean).join(" ");
    if (name) return name;
    if (value.title) return value.title;
    if (value.name) return value.name;
    return "Updated";
  }

  return String(value);
};

export const isNoOpActivity = (activity) => {
  if (!activity?.changeType) return false;
  if (activity.changeType === "created" || activity.changeType === "deleted") {
    return false;
  }
  if (activity.changeType === "due_date_change") {
    return toDateKey(activity.oldValue) === toDateKey(activity.newValue);
  }
  if (
    activity.changeType === "status_change" ||
    activity.changeType === "priority_change" ||
    activity.changeType === "title_change"
  ) {
    return String(activity.oldValue || "").trim() === String(activity.newValue || "").trim();
  }
  return false;
};

const quoted = (value) => `"${value}"`;

export const getActivityMessage = (activity) => {
  const subject =
    activity.action === "subtask_change"
      ? activity.subTask?.title
      : activity.task?.title;

  switch (activity.action) {
    case "logged_time":
      return `Logged ${activity.duration} minutes on ${quoted(
        activity.task?.title || "a task"
      )}`;
    case "task_change":
    case "subtask_change": {
      const itemLabel = activity.action === "subtask_change" ? "subtask" : "task";
      const itemName = subject || `a ${itemLabel}`;
      if (activity.changeType === "due_date_change") {
        return `Changed ${itemLabel} due date of ${quoted(itemName)} from ${quoted(
          formatActivityValue(activity.oldValue, activity.changeType)
        )} to ${quoted(formatActivityValue(activity.newValue, activity.changeType))}`;
      }
      if (activity.changeType === "status_change") {
        return `Changed ${itemLabel} status of ${quoted(itemName)} from ${quoted(
          formatActivityValue(activity.oldValue, activity.changeType)
        )} to ${quoted(formatActivityValue(activity.newValue, activity.changeType))}`;
      }
      if (activity.changeType === "priority_change") {
        return `Changed ${itemLabel} priority of ${quoted(itemName)} from ${quoted(
          formatActivityValue(activity.oldValue, activity.changeType)
        )} to ${quoted(formatActivityValue(activity.newValue, activity.changeType))}`;
      }
      if (activity.changeType === "assignment_change") {
        return `Updated assignees on ${itemLabel} ${quoted(itemName)}`;
      }
      if (activity.changeType === "created") {
        return `Created ${itemLabel} ${quoted(itemName)}`;
      }
      if (activity.changeType === "deleted") {
        return `Deleted ${itemLabel} ${quoted(itemName)}`;
      }
      return (
        activity.description || `Updated ${itemLabel} ${quoted(itemName)}`
      );
    }
    case "task_update": {
      const statusText =
        {
          todo: "To Do",
          "in-progress": "In Progress",
          completed: "Completed",
        }[activity.task?.status] || activity.task?.status;
      return `Updated ${quoted(activity.task?.title || "a task")} status to ${statusText}`;
    }
    case "project_created":
      return `Created new project ${quoted(activity.project?.name || "Untitled")}`;
    case "project_updated":
      return `Updated project ${quoted(activity.project?.name || "Untitled")} (${
        activity.project?.progress || 0
      }% complete)`;
    case "file_attachment":
      return `Added ${activity.attachments?.length || 1} file(s) to ${quoted(
        activity.task?.title || "a task"
      )}`;
    default:
      return activity.description || "Performed an action";
  }
};
