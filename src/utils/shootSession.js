/**
 * A "shoot session" is a task/subtask whose category is set to cover other
 * scheduled tasks (Settings → Master → Task Category). Sending it to review
 * needs the footage link and the tasks that were shot.
 */

export const FOOTAGE_LINK_LABEL = "Footage Drive Link";

export const getShootCategory = (item) => {
  const own = item?.taskCategory;
  if (own && typeof own === "object" && own.coversWork) return own;
  const parent = item?.parentTask?.taskCategory;
  if (parent && typeof parent === "object" && parent.coversWork) return parent;
  return null;
};

export const isShootSessionSubtask = (subtask) => Boolean(getShootCategory(subtask));

export const getShootWorkType = (subtask) =>
  getShootCategory(subtask)?.coversWorkType || "reels";

/** Put the footage link on the subtask so the existing work-link rule is met. */
export const withFootageLink = (customFields = [], link = "") => {
  if (!String(link || "").trim()) return customFields;
  const rest = (Array.isArray(customFields) ? customFields : []).filter(
    (field) => field?.label !== FOOTAGE_LINK_LABEL
  );
  return [...rest, { label: FOOTAGE_LINK_LABEL, value: link, type: "url" }];
};

export const isHttpLink = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(String(value || "").trim()).protocol);
  } catch (e) {
    return false;
  }
};
