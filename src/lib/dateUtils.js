export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// "YYYY-MM" of a date in the viewer's local time, or "" when there is no valid date.
export const getMonthKey = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// "Nov 2026" for a "YYYY-MM" key.
export const formatMonthKeyShort = (monthKey) => {
  if (!monthKey) return "";
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};
