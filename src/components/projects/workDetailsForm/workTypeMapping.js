export const STANDARD_WORK_TYPES = [
  { key: "reels", label: "Reels", aliases: ["reels", "reel"] },
  { key: "poster", label: "Posters", aliases: ["poster", "posters"] },
  {
    key: "motionPoster",
    label: "Motion Posters",
    aliases: ["motion poster", "motion posters"],
  },
  { key: "shooting", label: "Shooting", aliases: ["shooting"] },
  {
    key: "motionGraphics",
    label: "Motion Graphics",
    aliases: ["motion graphics", "motion graphic"],
  },
];

const normalizeName = (name) => String(name || "").trim().toLowerCase();

export const matchStandardWorkType = (name) => {
  const normalized = normalizeName(name);
  if (!normalized) return null;
  const match = STANDARD_WORK_TYPES.find(
    (type) => type.key.toLowerCase() === normalized || type.aliases.includes(normalized)
  );
  return match?.key || null;
};

const hasQuota = (slot) =>
  Boolean(slot) && [slot.count, slot.total].some((value) => Number(value) > 0);

export const resolveTaskCategoryId = ({
  taskGroup,
  extraTaskWorkType,
  workDetails,
  categories = [],
}) => {
  if (!taskGroup || taskGroup === "campaign") return "";

  const typeKey =
    taskGroup === "extraTask" ? extraTaskWorkType : taskGroup;
  if (!typeKey || typeKey === "general") return "";

  const standardKey =
    matchStandardWorkType(typeKey) ||
    (STANDARD_WORK_TYPES.some((type) => type.key === typeKey) ? typeKey : null);

  if (standardKey) {
    const matched = (categories || []).find(
      (category) => matchStandardWorkType(category.name) === standardKey
    );
    return matched?._id ? String(matched._id) : "";
  }

  const otherItem = workDetails?.other?.find((item) => item.name === typeKey);
  const linkedId = otherItem?.taskCategory?._id || otherItem?.taskCategory;
  if (linkedId) return String(linkedId);

  const byName = (categories || []).find(
    (category) =>
      String(category.name || "").toLowerCase() === String(typeKey).toLowerCase()
  );
  return byName?._id ? String(byName._id) : "";
};

export const getSelectedWorkItems = (workDetails, categories = []) => {
  const items = [];

  STANDARD_WORK_TYPES.forEach(({ key, label }) => {
    const slot = workDetails?.[key];
    if (!hasQuota(slot)) return;
    const matchedCategory = (categories || []).find(
      (category) => matchStandardWorkType(category.name) === key
    );
    items.push({
      kind: "standard",
      key,
      name: matchedCategory?.name || label,
      taskCategory: matchedCategory?._id || null,
      count: slot.count || 0,
      total: slot.total || 0,
    });
  });

  (workDetails?.other || []).forEach((item, otherIndex) => {
    items.push({
      kind: "other",
      otherIndex,
      name: item.name,
      taskCategory: item.taskCategory || null,
      count: item.count || 0,
      total: item.total || 0,
    });
  });

  return items;
};

export const addCategoryToWorkDetails = (workDetails, payload, isEditMode = false) => {
  const next = {
    ...(workDetails || {}),
    other: [...(workDetails?.other || [])],
  };
  const count = Number(payload.count) || 0;
  const total = isEditMode ? Number(payload.total) || count : count;
  const standardKey = matchStandardWorkType(payload.name);

  if (standardKey) {
    next[standardKey] = {
      ...(next[standardKey] || {}),
      count,
      total,
      completed: next[standardKey]?.completed || 0,
      extra: next[standardKey]?.extra || 0,
      description: next[standardKey]?.description || "",
    };
    return next;
  }

  next.other.push({
    name: payload.name,
    taskCategory: payload.taskCategory || null,
    count,
    total,
    completed: 0,
    extra: 0,
    description: payload.description || "",
  });
  return next;
};

export const removeWorkItem = (workDetails, item) => {
  const next = {
    ...(workDetails || {}),
    other: [...(workDetails?.other || [])],
  };

  if (item.kind === "standard") {
    next[item.key] = {
      ...(next[item.key] || {}),
      count: 0,
      total: 0,
    };
    return next;
  }

  next.other = next.other.filter((_, index) => index !== item.otherIndex);
  return next;
};

export const updateWorkItemField = (
  workDetails,
  item,
  field,
  value,
  isEditMode = false
) => {
  const next = {
    ...(workDetails || {}),
    other: [...(workDetails?.other || [])],
  };
  const numericValue = Number(value) || 0;

  if (item.kind === "standard") {
    next[item.key] = {
      ...(next[item.key] || {}),
      [field]: numericValue,
    };
    if (!isEditMode && field === "count") {
      next[item.key].total = numericValue;
    }
    return next;
  }

  if (!next.other[item.otherIndex]) return next;
  next.other[item.otherIndex] = {
    ...next.other[item.otherIndex],
    [field]: numericValue,
  };
  if (!isEditMode && field === "count") {
    next.other[item.otherIndex].total = numericValue;
  }
  return next;
};
