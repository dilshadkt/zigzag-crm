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

export const matchStandardWorkType = (nameOrCategory) => {
  if (!nameOrCategory) return null;
  
  // If it's a category object with mapsToQuota, use that immediately
  if (typeof nameOrCategory === 'object' && nameOrCategory.mapsToQuota) {
    return nameOrCategory.mapsToQuota;
  }
  
  const name = typeof nameOrCategory === 'object' ? nameOrCategory.name : nameOrCategory;
  const normalized = normalizeName(name);
  if (!normalized) return null;
  const match = STANDARD_WORK_TYPES.find(
    (type) => type.key.toLowerCase() === normalized || type.aliases.includes(normalized)
  );
  return match?.key || null;
};

// An empty string means the user is mid-edit; keep the card visible until blur/submit.
export const hasQuota = (slot) =>
  Boolean(slot) &&
  [slot.count, slot.total].some((value) => value === "" || Number(value) > 0);

const toCount = (value) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

export const extraWorkTypeValueFromName = (name) =>
  matchStandardWorkType(name) || String(name || "").trim();

/** Master category time is stored in minutes. Task timeEstimate is stored in hours. */
export const taskMinutesToHours = (minutes) => {
  const mins = Number(minutes);
  if (!mins || mins <= 0) return null;
  const hours = mins / 60;
  return Number.isInteger(hours) ? hours : Math.round(hours * 100) / 100;
};

export const taskHoursToMinutes = (hours) => {
  const hrs = Number(hours);
  if (!hrs || hrs <= 0) return null;
  const minutes = hrs * 60;
  return Number.isInteger(minutes) ? minutes : Math.round(minutes * 100) / 100;
};

export const collectMonthlyExtraWork = (workDetails) => {
  const extras = [];

  STANDARD_WORK_TYPES.forEach(({ key, label }) => {
    const extra = Number(workDetails?.[key]?.extra) || 0;
    if (extra > 0) extras.push({ name: label, extra, kind: "standard", key });
  });

  (workDetails?.other || []).forEach((item, otherIndex) => {
    const extra = Number(item?.extra) || 0;
    if (extra > 0) {
      extras.push({
        name: item.name,
        extra,
        kind: "other",
        otherIndex
      });
    }
  });

  return extras;
};

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
      (category) => matchStandardWorkType(category) === standardKey
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
    const matchedCategory =
      (categories || []).find((category) => category.mapsToQuota === key) ||
      (categories || []).find(
        (category) => matchStandardWorkType(category) === key
      );
    items.push({
      kind: "standard",
      key,
      name: matchedCategory?.name || label,
      taskCategory: matchedCategory?._id || null,
      count: slot.count ?? 0,
      total: slot.total ?? 0,
      extra: slot.extra ?? 0,
    });
  });

  (workDetails?.other || []).forEach((item, otherIndex) => {
    if (!hasQuota(item)) return;
    items.push({
      kind: "other",
      otherIndex,
      name: item.name,
      taskCategory: item.taskCategory || null,
      count: item.count ?? 0,
      total: item.total ?? 0,
      extra: item.extra ?? 0,
    });
  });

  return items;
};

export const addCategoryToWorkDetails = (workDetails, payload, isEditMode = false, categories = []) => {
  const next = {
    ...(workDetails || {}),
    other: [...(workDetails?.other || [])],
  };
  const count = Number(payload.count) || 0;
  const total = isEditMode ? Number(payload.total) || count : count;
  
  // Try to find the full category object if we only have the ID/name
  const categoryObj = payload.taskCategory ? 
    categories.find(c => String(c._id) === String(payload.taskCategory)) : 
    payload;

  const standardKey = matchStandardWorkType(categoryObj || payload.name);

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

  const existingOtherIndex = next.other.findIndex(
    (item) =>
      String(item.name || "").trim().toLowerCase() ===
      String(payload.name || "").trim().toLowerCase()
  );
  if (existingOtherIndex >= 0) {
    next.other[existingOtherIndex] = {
      ...next.other[existingOtherIndex],
      name: payload.name,
      taskCategory:
        payload.taskCategory || next.other[existingOtherIndex].taskCategory,
      count,
      total,
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
  const numericValue = value === "" ? "" : toCount(value);

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

export const swapCategoryInWorkDetails = (workDetails, oldItem, newCategory) => {
  let next = {
    ...(workDetails || {}),
    other: [...(workDetails?.other || [])],
  };

  // We are swapping the old item for the new category, but keeping count/total/completed
  const count = oldItem.count || 0;
  const total = oldItem.total || 0;
  const completed = oldItem.completed || 0;
  const extra = oldItem.extra || 0;

  // First, remove the old item completely
  next = removeWorkItem(next, oldItem);

  // Then add the new item with the old item's stats
  const standardKey = matchStandardWorkType(newCategory);
  
  if (standardKey) {
    next[standardKey] = {
      ...(next[standardKey] || {}),
      count: (next[standardKey]?.count || 0) + count,
      total: (next[standardKey]?.total || 0) + total,
      completed: (next[standardKey]?.completed || 0) + completed,
      extra: (next[standardKey]?.extra || 0) + extra,
    };
    return next;
  }

  // If it's custom, add to other
  const existingOtherIndex = next.other.findIndex(
    (i) => String(i.name || "").trim().toLowerCase() === String(newCategory.name || "").trim().toLowerCase()
  );

  if (existingOtherIndex >= 0) {
    next.other[existingOtherIndex].count += count;
    next.other[existingOtherIndex].total += total;
    next.other[existingOtherIndex].completed += completed;
    next.other[existingOtherIndex].extra += extra;
  } else {
    next.other.push({
      name: newCategory.name,
      taskCategory: newCategory._id || null,
      count,
      total,
      completed,
      extra,
      description: "",
    });
  }

  return next;
};

const SLOT_NUMBER_FIELDS = ["count", "total", "completed", "extra"];

const cleanSlot = (slot) => {
  const next = { ...slot };
  SLOT_NUMBER_FIELDS.forEach((field) => {
    next[field] = toCount(slot?.[field]);
  });
  return next;
};

const isEmptySlot = (slot) =>
  SLOT_NUMBER_FIELDS.every((field) => slot[field] === 0) && !slot.description;

const cleanMonthWorkDetails = (monthDetails) => {
  if (!monthDetails || typeof monthDetails !== "object") return monthDetails;
  const next = { ...monthDetails };

  STANDARD_WORK_TYPES.forEach(({ key }) => {
    if (!next[key]) return;
    const slot = cleanSlot(next[key]);
    if (isEmptySlot(slot)) delete next[key];
    else next[key] = slot;
  });

  next.other = (monthDetails.other || [])
    .map(cleanSlot)
    .filter((item) => item.name && !isEmptySlot(item));

  return next;
};

/**
 * Normalises half-typed inputs ("" → 0) and drops unused zero-only slots so the
 * request only carries work types the project actually has. Unused standard
 * slots are re-created with zero defaults by the backend schema.
 */
export const cleanWorkDetailsForSubmit = (workDetails) =>
  Array.isArray(workDetails)
    ? workDetails.map(cleanMonthWorkDetails)
    : cleanMonthWorkDetails(workDetails);
