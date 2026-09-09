export const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatAttendanceTime = (value) => {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatBreakMinutes = (minutes) => {
  const total = Number(minutes) || 0;
  if (total <= 0) return "0m";
  const hours = Math.floor(total / 60);
  const mins = Math.round(total % 60);
  if (hours <= 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const hasPendingCorrection = (record) =>
  record?.correctionRequest?.status === "pending";
