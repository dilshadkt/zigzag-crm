const PUBLISH_WORDS = ["publish", "publishing", "published"];

export const normalizePublishText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length];
};

const wordCloseToPublish = (word) => {
  if (!word) return false;
  if (word.includes("publish")) return true;

  return PUBLISH_WORDS.some((target) => {
    const maxDist = target.length <= 7 ? 1 : 2;
    if (Math.abs(word.length - target.length) > maxDist) return false;
    return levenshtein(word, target) <= maxDist;
  });
};

export const isPublishRelatedName = (value) => {
  const text = normalizePublishText(value);
  if (!text) return false;
  if (text.includes("publish")) return true;

  const compact = text.replace(/\s+/g, "");
  if (
    compact.includes("publishingandschedul") ||
    compact.includes("publishandschedul") ||
    compact.includes("scheduleandpublish") ||
    compact.includes("schedulingandpublish")
  ) {
    return true;
  }

  return text.split(" ").some(wordCloseToPublish);
};

const getCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "object") return category.name || "";
  return "";
};

export const isPublishRelatedSubtask = (subtask = {}) => {
  const title = subtask.title || subtask.taskName || "";
  const categoryName =
    subtask.categoryName ||
    getCategoryName(subtask.taskCategory) ||
    subtask.category ||
    "";

  return isPublishRelatedName(title) || isPublishRelatedName(categoryName);
};
