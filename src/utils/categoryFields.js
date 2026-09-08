/**
 * Task categories (Settings → Master) can define the fields their tasks and
 * subtasks must capture — the configurable version of the hard-coded "Content"
 * subtask fields. Values live on `subTask.categoryFieldValues`.
 */

export const CATEGORY_FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "voice", label: "Voice" },
];

export const getVoiceUrls = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        return String(item?.url || item?.preview || "").trim();
      })
      .filter(Boolean);
  }
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (typeof value === "object") {
    const url = String(value.url || value.preview || "").trim();
    return url ? [url] : [];
  }
  return [];
};

export const isCategoryFieldFilled = (field) => {
  if (!field) return false;
  if (field.type === "voice") return getVoiceUrls(field.value).length > 0;
  return String(field.value ?? "").trim() !== "";
};

export const toCategoryFieldKey = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getCategoryFieldDefinitions = (category) => {
  const fields = category?.fields;
  if (!Array.isArray(fields)) return [];
  return fields.filter((field) => field?.key && field?.label);
};

const valueOf = (entry) => {
  if (entry?.type === "voice") return getVoiceUrls(entry?.value);
  if (entry?.value === undefined || entry?.value === null) return "";
  return entry.value;
};

/**
 * Pair the category's current field definitions with whatever the subtask has
 * already stored, so renaming a field keeps its value and removing one keeps
 * the old answer visible instead of silently dropping it.
 */
export const mergeCategoryFieldValues = (definitions = [], existing = []) => {
  const stored = new Map(
    (Array.isArray(existing) ? existing : [])
      .filter((entry) => entry?.key)
      .map((entry) => [entry.key, entry])
  );

  const merged = definitions.map((definition) => {
    const previous = stored.get(definition.key);
    stored.delete(definition.key);
    return {
      key: definition.key,
      label: definition.label,
      type: definition.type || "text",
      placeholder: definition.placeholder || "",
      options: Array.isArray(definition.options) ? definition.options : [],
      required: Boolean(definition.required),
      showInDescription: Boolean(definition.showInDescription),
      value: previous
        ? definition.type === "voice"
          ? getVoiceUrls(previous.value)
          : valueOf(previous)
        : definition.type === "voice"
          ? []
          : "",
    };
  });

  // Orphans: answers whose definition was removed from the category.
  stored.forEach((entry) => {
    if (!isCategoryFieldFilled(entry)) return;
    merged.push({
      key: entry.key,
      label: entry.label || entry.key,
      type: entry.type || "text",
      placeholder: "",
      options: [],
      required: false,
      showInDescription: Boolean(entry.showInDescription),
      value: valueOf(entry),
    });
  });

  return merged;
};

/** Definitions for a task or subtask, taken from its populated category. */
export const getSubTaskCategoryFields = (item) =>
  mergeCategoryFieldValues(
    getCategoryFieldDefinitions(item?.taskCategory),
    item?.categoryFieldValues || []
  );

export const getCategoryById = (categories = [], categoryId) => {
  if (!categoryId) return null;
  const id = String(categoryId._id || categoryId);
  const fromList = (Array.isArray(categories) ? categories : []).find(
    (category) => String(category._id) === id
  );
  if (fromList) return fromList;
  if (typeof categoryId === "object") return categoryId;
  return null;
};

export const getFieldsForCategoryId = (
  categories,
  categoryId,
  existingValues = []
) =>
  mergeCategoryFieldValues(
    getCategoryFieldDefinitions(getCategoryById(categories, categoryId)),
    existingValues
  );

export const findMissingRequiredCategoryField = (fields = []) =>
  fields.find((field) => field.required && !isCategoryFieldFilled(field));

/** Prompt for category fields when sending work to review. */
export const needsCategoryFieldsForReview = (item) => {
  const fields = getSubTaskCategoryFields(item);
  if (!fields.length) return false;
  if (findMissingRequiredCategoryField(fields)) return true;
  return fields.every((field) => !isCategoryFieldFilled(field));
};

/** Only the entries that actually have an answer. */
export const getFilledCategoryFieldValues = (item) =>
  getSubTaskCategoryFields(item).filter((field) => isCategoryFieldFilled(field));

/** Answers flagged to appear in the main task description block. */
export const getDescriptionCategoryFields = (subTasks = [], parentTask = null) => {
  const fromParent = parentTask
    ? getFilledCategoryFieldValues(parentTask).map((field) => ({
        ...field,
        subTaskId: parentTask?._id,
        subTaskTitle: null,
      }))
    : [];

  const fromSubtasks = (Array.isArray(subTasks) ? subTasks : []).flatMap(
    (subTask) =>
      getFilledCategoryFieldValues(subTask)
        .filter((field) => field.showInDescription)
        .map((field) => ({
          ...field,
          subTaskId: subTask?._id,
          subTaskTitle: subTask?.title,
        }))
  );

  return [...fromParent, ...fromSubtasks];
};
